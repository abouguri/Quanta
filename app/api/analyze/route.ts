import { analyzeArticle } from '@/lib/analyze'
import { scrapeArticle } from '@/lib/scraper'
import { Redis } from '@upstash/redis'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Quanta-Install-Id',
}

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_S = 24 * 60 * 60

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? Redis.fromEnv()
  : null

const inMemoryStore = new Map<string, number[]>()

async function checkRateLimit(installId: string): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  if (redis) {
    const key = `quanta:rl:${installId}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW_S)
    if (count > RATE_LIMIT_MAX) {
      const ttl = await redis.ttl(key)
      return { ok: false, retryAfter: Math.max(ttl, 1) }
    }
    return { ok: true }
  }

  const now = Date.now()
  const windowMs = RATE_LIMIT_WINDOW_S * 1000
  const cutoff = now - windowMs
  const recent = (inMemoryStore.get(installId) ?? []).filter(t => t > cutoff)
  if (recent.length >= RATE_LIMIT_MAX) {
    inMemoryStore.set(installId, recent)
    return { ok: false, retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000) }
  }
  recent.push(now)
  inMemoryStore.set(installId, recent)
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
      const rl = await checkRateLimit(installId)
      if (!rl.ok) {
        return json(
          { error: 'Daily free limit reached. Try again later.', retryAfter: rl.retryAfter },
          { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
      }
    }

    const body = await request.json() as {
      articleUrl?: string
      articleText?: string
      language?: string
      // TODO: replace with server-side subscription check once auth is wired up
      tier?: 'free' | 'paid'
    }
    const { articleUrl, articleText, language = 'en', tier = 'paid' } = body

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

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const enc = new TextEncoder()
        try {
          for await (const frame of analyzeArticle(trimmedText, metadata, tier, language)) {
            const payload = frame.type === 'step'
              ? { step: frame.step, label: frame.label, progress: frame.progress }
              : frame.data
            controller.enqueue(enc.encode(`data: ${JSON.stringify(payload)}\n\n`))
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Analysis failed'
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: message })}\n\n`))
        } finally {
          controller.close()
        }
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
