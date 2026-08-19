import { load } from 'cheerio'
import { ScrapedArticle } from '@/types/analysis'
import { assertSafeUrl, UnsafeUrlError } from './urlGuard'

const FETCH_TIMEOUT_MS = 12_000
const MAX_REDIRECTS = 5
/** Stop reading at 2 MB — an article is text, anything larger is not one. */
const MAX_BYTES = 2 * 1024 * 1024
const MAX_ARTICLE_CHARS = 10_000

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

/** Thrown when the page could be reached but is not usable as an article. */
export class ScrapeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScrapeError'
  }
}

/**
 * Fetches a URL, re-validating every redirect hop.
 *
 * `redirect: 'follow'` would let a public URL bounce us to 127.0.0.1 after the
 * guard had already approved the original host, so each Location is run back
 * through `assertSafeUrl`.
 */
async function fetchSafely(startUrl: string): Promise<Response> {
  let url = await assertSafeUrl(startUrl)

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      url = await assertSafeUrl(new URL(location, url).toString())
      continue
    }

    return response
  }

  throw new ScrapeError('That URL redirected too many times.')
}

/** Reads the body as text, giving up once it exceeds MAX_BYTES. */
async function readCapped(response: Response): Promise<string> {
  const reader = response.body?.getReader()
  if (!reader) return ''

  const decoder = new TextDecoder('utf-8')
  let text = ''
  let bytes = 0

  try {
    while (bytes < MAX_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      text += decoder.decode(value, { stream: true })
    }
  } finally {
    await reader.cancel().catch(() => { /* already closed */ })
  }

  return text + decoder.decode()
}

export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
  const response = await fetchSafely(url)

  if (!response.ok) {
    throw new ScrapeError(`The page returned HTTP ${response.status}.`)
  }

  // A PDF or a video would otherwise be fed to the model as gibberish "text".
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType && !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
    throw new ScrapeError(`That URL is not an article (served ${contentType.split(';')[0].trim()}).`)
  }

  const html = await readCapped(response)
  const $ = load(html)

  const title = $('h1').first().text() || $('title').text() || ''

  $('script, style, nav, noscript, .navigation, .sidebar, footer, .ads').remove()

  let text = ''
  const articleSelectors = [
    'article',
    '[role="main"]',
    '.article-body',
    '.post-content',
    '.entry-content',
    'main',
  ]

  for (const selector of articleSelectors) {
    const found = $(selector).text()
    if (found.length > 200) {
      text = found
      break
    }
  }

  if (!text || text.length < 200) {
    text = $('p').map((_: number, el: any) => $(el).text()).get().join('\n')
  }

  const author =
    $('[rel="author"]').text() ||
    $('[itemprop="author"]').text() ||
    $('.author').text() ||
    $('[data-author]').attr('data-author') ||
    ''

  const publishedDate =
    $('[itemprop="datePublished"]').attr('content') ||
    $('time').attr('datetime') ||
    $('[data-published-date]').attr('data-published-date') ||
    ''

  const source = new URL(response.url || url).hostname.replace(/^www\./, '')

  const cleanText = text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
    .substring(0, MAX_ARTICLE_CHARS)

  return {
    title: title.trim().substring(0, 500),
    text: cleanText,
    author: author.trim().substring(0, 200),
    publishedDate: publishedDate.trim(),
    source,
  }
}

/**
 * Turns whatever `scrapeArticle` threw into one sentence fit for the UI.
 * Errors used to be wrapped twice on the way out ("Failed to scrape article:
 * Failed to scrape article: ...").
 */
export function describeScrapeFailure(error: unknown): string {
  if (error instanceof UnsafeUrlError || error instanceof ScrapeError) return error.message
  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return 'That page took too long to respond.'
    }
    return `Could not fetch that page: ${error.message}`
  }
  return 'Could not fetch that page.'
}
