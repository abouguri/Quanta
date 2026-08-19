import { beforeEach, describe, expect, it, vi } from 'vitest'

const lookup = vi.hoisted(() => vi.fn())
vi.mock('dns/promises', () => ({ lookup }))

import { describeScrapeFailure, ScrapeError, scrapeArticle } from '@/lib/scraper'
import { UnsafeUrlError } from '@/lib/urlGuard'

const PUBLIC = [{ address: '93.184.216.34' }]

const ARTICLE_HTML = `
  <html>
    <head><title>Site name</title></head>
    <body>
      <h1>Council approves the new transit line</h1>
      <article>
        <span rel="author">Dana Reporter</span>
        <time datetime="2026-03-04">March 4</time>
        <p>${'The council voted to approve funding for the line. '.repeat(12)}</p>
      </article>
      <script>tracking()</script>
      <footer>subscribe now</footer>
    </body>
  </html>`

function html(body: string, init: ResponseInit = {}): Response {
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    ...init,
  })
}

describe('scrapeArticle', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    lookup.mockReset()
    lookup.mockResolvedValue(PUBLIC)
  })

  it('pulls title, body, author and date out of a page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(html(ARTICLE_HTML)))

    const article = await scrapeArticle('https://news.example.com/transit')

    expect(article.title).toBe('Council approves the new transit line')
    expect(article.author).toBe('Dana Reporter')
    expect(article.publishedDate).toBe('2026-03-04')
    expect(article.source).toBe('news.example.com')
    expect(article.text).toContain('approve funding')
    expect(article.text).not.toContain('tracking()')
    expect(article.text).not.toContain('subscribe now')
  })

  it('strips a www. prefix from the source', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(html(ARTICLE_HTML)))
    const article = await scrapeArticle('https://www.news.example.com/transit')
    expect(article.source).toBe('news.example.com')
  })

  it('refuses a URL that points at a private address', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(scrapeArticle('http://169.254.169.254/latest/meta-data/')).rejects.toThrow(
      UnsafeUrlError,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('re-checks each redirect hop instead of trusting the first host', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, { status: 302, headers: { location: 'http://127.0.0.1:8080/admin' } }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(scrapeArticle('https://news.example.com/redirector')).rejects.toThrow(
      /private address/,
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('follows a redirect that stays on public hosts', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, { status: 301, headers: { location: '/final' } }),
      )
      .mockResolvedValueOnce(html(ARTICLE_HTML))
    vi.stubGlobal('fetch', fetchMock)

    const article = await scrapeArticle('https://news.example.com/old')
    expect(article.title).toBe('Council approves the new transit line')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('gives up on a redirect loop', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(null, { status: 302, headers: { location: 'https://news.example.com/loop' } }),
      ),
    )
    await expect(scrapeArticle('https://news.example.com/loop')).rejects.toThrow(/redirected too many/)
  })

  it('reports the upstream status rather than an empty article', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 404 })))
    await expect(scrapeArticle('https://news.example.com/gone')).rejects.toThrow(/HTTP 404/)
  })

  it('refuses a response that is not a document', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('%PDF-1.7', { status: 200, headers: { 'Content-Type': 'application/pdf' } }),
      ),
    )
    await expect(scrapeArticle('https://news.example.com/report.pdf')).rejects.toThrow(
      /not an article/,
    )
  })
})

describe('describeScrapeFailure', () => {
  it('passes our own messages through unwrapped', () => {
    expect(describeScrapeFailure(new ScrapeError('The page returned HTTP 404.'))).toBe(
      'The page returned HTTP 404.',
    )
    expect(describeScrapeFailure(new UnsafeUrlError('That URL points at a private address.'))).toBe(
      'That URL points at a private address.',
    )
  })

  it('names a timeout for what it is', () => {
    const timeout = new Error('The operation was aborted due to timeout')
    timeout.name = 'TimeoutError'
    expect(describeScrapeFailure(timeout)).toMatch(/took too long/)
  })

  it('falls back to a single wrapped sentence', () => {
    expect(describeScrapeFailure(new Error('ECONNREFUSED'))).toBe(
      'Could not fetch that page: ECONNREFUSED',
    )
    expect(describeScrapeFailure('weird')).toBe('Could not fetch that page.')
  })
})
