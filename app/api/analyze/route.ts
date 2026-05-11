import { analyzeArticle } from '@/lib/analyze'
import { scrapeArticle } from '@/lib/scraper'
import { AnalysisResult } from '@/types/analysis'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { articleUrl?: string; articleText?: string; language?: string }
    const { articleUrl, articleText, language = 'en' } = body

    // Validate input
    if (!articleUrl && !articleText) {
      return new Response(
        JSON.stringify({ error: 'Either articleUrl or articleText is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let text = articleText || ''
    let metadata: { title?: string; source?: string; author?: string; publishedDate?: string } = {}

    // If URL provided, scrape it
    if (articleUrl) {
      try {
        console.log('Scraping article from URL:', articleUrl)
        const scraped = await scrapeArticle(articleUrl)
        text = scraped.text
        metadata = {
          title: scraped.title,
          source: scraped.source,
          author: scraped.author,
          publishedDate: scraped.publishedDate,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return new Response(
          JSON.stringify({ error: `Failed to scrape article: ${message}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Validate text length
    const trimmedText = text.trim()
    if (trimmedText.length < 100) {
      return new Response(
        JSON.stringify({ error: 'Article text must be at least 100 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Run analysis
    console.log('Starting analysis for article')
    const result = await analyzeArticle(trimmedText, metadata, language)

    // Return as SSE stream
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        // Send progress updates
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ status: 'analyzing', progress: 25 })}\n\n`)
        )

        // Send final result
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(result)}\n\n`)
        )

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('API error:', message)

    return new Response(
      JSON.stringify({ error: message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
