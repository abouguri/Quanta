import { analyzeArticle } from '@/lib/analyze'
import { scrapeArticle } from '@/lib/scraper'
import { Redis } from '@upstash/redis'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Quanta-Install-Id',
  'Access-Control-Expose-Headers': 'X-RateLimit-Remaining, Retry-After',
}

// Analyses per 24h. Extension installs identify themselves and get the tighter
// quota; everyone else is bucketed by IP, which is coarse (shared NAT, offices)
// so it is deliberately more generous.
const RATE_LIMIT_INSTALL_MAX = 3
const RATE_LIMIT_IP_MAX = 10
const RATE_LIMIT_WINDOW_S = 24 * 60 * 60

// Every request runs the full pipeline against paid third-party APIs, so the
// limit is the only thing standing between a public endpoint and our API keys.
// Disabled outside production so local development isn't throttled.
const RATE_LIMIT_ENABLED = process.env.NODE_ENV === 'production'

// Constructed defensively: a malformed URL would otherwise throw at module
// load and take every request down with an opaque 500.
const redis = (() => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  try {
    return Redis.fromEnv()
  } catch (error) {
    console.error('Upstash config invalid, using in-memory rate limiting:', error instanceof Error ? error.message : error)
    return null
  }
})()

const inMemoryStore = new Map<string, number[]>()

/**
 * Identifies the caller. An install ID is self-reported and trivially forged —
 * it exists to give honest extension users a stable bucket, not to authenticate.
 * The IP bucket is the actual floor.
 */
function rateLimitBucket(request: Request): { key: string; max: number } {
  const installId = request.headers.get('x-quanta-install-id')
  if (installId) return { key: `install:${installId.slice(0, 64)}`, max: RATE_LIMIT_INSTALL_MAX }

  const forwarded = request.headers.get('x-forwarded-for') ?? ''
  const ip = forwarded.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
  return { key: `ip:${ip}`, max: RATE_LIMIT_IP_MAX }
}

type RateLimitVerdict = { ok: true; remaining: number } | { ok: false; retryAfter: number }

async function checkRateLimit(bucket: { key: string; max: number }): Promise<RateLimitVerdict> {
  const { key, max } = bucket

  if (redis) {
    try {
      const redisKey = `quanta:rl:${key}`
      const count = await redis.incr(redisKey)
      if (count === 1) await redis.expire(redisKey, RATE_LIMIT_WINDOW_S)
      if (count > max) {
        const ttl = await redis.ttl(redisKey)
        return { ok: false, retryAfter: Math.max(ttl, 1) }
      }
      return { ok: true, remaining: max - count }
    } catch (error) {
      // An unreachable limiter must never take the API down with it. Upstash
      // free databases are deleted after inactivity, which used to surface as
      // a bare 500 to every caller that carried an install ID. Fall through
      // to the in-memory counter: weaker (per-instance, resets on deploy) but
      // still bounded, and the request survives.
      console.error('Rate limit store unavailable, falling back to memory:', error instanceof Error ? error.message : error)
    }
  }

  const now = Date.now()
  const windowMs = RATE_LIMIT_WINDOW_S * 1000
  const cutoff = now - windowMs
  const recent = (inMemoryStore.get(key) ?? []).filter(t => t > cutoff)
  if (recent.length >= max) {
    inMemoryStore.set(key, recent)
    return { ok: false, retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000) }
  }
  recent.push(now)
  inMemoryStore.set(key, recent)
  return { ok: true, remaining: max - recent.length }
}

/**
 * The tier is decided here and nowhere else. It used to be read straight off
 * the request body, which meant any caller could switch on the full paid
 * pipeline. There is no auth yet, so everyone gets `paid` within their quota —
 * but the decision now has one server-side home for a subscription check to
 * slot into.
 *
 * TODO: return 'free' unless the session carries an active subscription.
 */
function resolveTier(): 'free' | 'paid' {
  return 'paid'
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
    let remaining: number | null = null
    if (RATE_LIMIT_ENABLED) {
      const rl = await checkRateLimit(rateLimitBucket(request))
      if (!rl.ok) {
        return json(
          { error: 'Daily free limit reached. Try again later.', retryAfter: rl.retryAfter },
          { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
      }
      remaining = rl.remaining
    }

    const body = await request.json() as {
      articleUrl?: string
      articleText?: string
      language?: string
    }
    const { articleUrl, articleText, language = 'en' } = body
    const tier = resolveTier()

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
        ...(remaining === null ? {} : { 'X-RateLimit-Remaining': String(remaining) }),
        ...CORS_HEADERS,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('API error:', message)
    return json({ error: message || 'Internal server error' }, { status: 500 })
  }
}
