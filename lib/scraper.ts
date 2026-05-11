import { load } from 'cheerio'
import { ScrapedArticle } from '@/types/analysis'

export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }

    const html = await response.text()
    const $ = load(html)

    // Extract title
    const title = $('h1').first().text() || $('title').text() || ''

    // Extract article text (remove script, style, nav, etc.)
    $('script, style, nav, noscript, .navigation, .sidebar, footer, .ads').remove()

    // Try common article body selectors
    let text = ''
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.article-body',
      '.post-content',
      '.entry-content',
      'main'
    ]

    for (const selector of articleSelectors) {
      const found = $(selector).text()
      if (found.length > 200) {
        text = found
        break
      }
    }

    // Fallback: extract all paragraphs
    if (!text || text.length < 200) {
      text = $('p').map((_: number, el: any) => $(el).text()).get().join('\n')
    }

    // Extract author
    const author =
      $('[rel="author"]').text() ||
      $('[itemprop="author"]').text() ||
      $('.author').text() ||
      $('[data-author]').attr('data-author') ||
      ''

    // Extract publish date
    const publishedDate =
      $('[itemprop="datePublished"]').attr('content') ||
      $('time').attr('datetime') ||
      $('[data-published-date]').attr('data-published-date') ||
      ''

    // Extract source from URL
    const urlObj = new URL(url)
    const source = urlObj.hostname.replace('www.', '')

    // Clean up text
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
      .substring(0, 10000) // Limit to 10k chars

    return {
      title: title.trim().substring(0, 500),
      text: cleanText,
      author: author.trim().substring(0, 200),
      publishedDate: publishedDate.trim(),
      source
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to scrape article: ${message}`)
  }
}
