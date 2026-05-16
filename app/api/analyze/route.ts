import { analyzeArticle } from '@/lib/analyze'
import { scrapeArticle } from '@/lib/scraper'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Quanta-Install-Id',
}

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000

// In-memory rate limit. Survives a single warm Vercel instance; resets on cold start.
// Upgrade to KV/Redis when traffic grows past a single instance.
const rateLimitStore = new Map<string, number[]>()

function checkRateLimit(installId: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const recent = (rateLimitStore.get(installId) ?? []).filter(t => t > cutoff)
  if (recent.length >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((recent[0] + RATE_LIMIT_WINDOW_MS - now) / 1000)
    rateLimitStore.set(installId, recent)
    return { ok: false, retryAfter }
  }
  recent.push(now)
  rateLimitStore.set(installId, recent)
  return { ok: true }
}

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...(init.headers ?? {}) },
  })
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request): Promise<Response> {
  try {
    const installId = request.headers.get('x-quanta-install-id')
    if (installId) {
      const rl = checkRateLimit(installId)
      if (!rl.ok) {
        return json(
          { error: 'Daily free limit reached. Try again later.', retryAfter: rl.retryAfter },
          { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
      }
    }

    const body = await request.json() as { articleUrl?: string; articleText?: string; language?: string }
    const { articleUrl, articleText, language = 'en' } = body

    if (!articleUrl && !articleText) {
      return json({ error: 'Either articleUrl or articleText is required' }, { status: 400 })
    }

    let text = articleText || ''
    let metadata: { title?: string; source?: string; author?: string; publishedDate?: string } = {}

    if (articleUrl) {
      try {
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
        return json({ error: `Failed to scrape article: ${message}` }, { status: 400 })
      }
    }

    const trimmedText = text.trim()
    if (trimmedText.length < 100) {
      return json({ error: 'Article text must be at least 100 characters' }, { status: 400 })
    }

    const result = await analyzeArticle(trimmedText, metadata, language)

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const enc = new TextEncoder()
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ status: 'analyzing', progress: 25 })}\n\n`))
        controller.enqueue(enc.encode(`data: ${JSON.stringify(result)}\n\n`))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...CORS_HEADERS,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('API error:', message)
    return json({ error: message || 'Internal server error' }, { status: 500 })
  }
}
