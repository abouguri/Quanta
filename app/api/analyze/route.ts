import { analyzeArticle } from '@/lib/analyze'
import { describeScrapeFailure, scrapeArticle } from '@/lib/scraper'
import type { AnalysisErrorCode } from '@/types/analysis'
import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

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
// Generous, not infinite: this endpoint calls paid third-party APIs (Groq,
// Brave) on every request, so a single compromised paid account shouldn't be
// an unlimited-spend vector.
const RATE_LIMIT_PAID_MAX = 200
const RATE_LIMIT_WINDOW_S = 24 * 60 * 60

// Every request runs the full pipeline against paid third-party APIs, so the
// limit is the only thing standing between a public endpoint and our API keys.
// Disabled outside production so local development isn't throttled.
const RATE_LIMIT_ENABLED = process.env.NODE_ENV === 'production'

// The scraper already caps what it returns at 10k chars; this caps what a
// caller can push in directly. Above this the request is not an article.
const MAX_ARTICLE_TEXT_CHARS = 50_000

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
 * Identifies the caller. A signed-in user gets their own bucket — a strict
 * improvement over the IP bucket (which a whole household or office NAT
 * shares), not a loosening — sized by tier. Otherwise: an install ID is
 * self-reported and trivially forged; it exists to give honest extension
 * users a stable bucket, not to authenticate. The IP bucket is the actual
 * floor for everyone else.
 */
function rateLimitBucket(request: Request, userId: string | null, tier: 'free' | 'paid'): { key: string; max: number } {
  if (userId) return { key: `user:${userId}`, max: tier === 'paid' ? RATE_LIMIT_PAID_MAX : RATE_LIMIT_IP_MAX }

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
 * Hands a consumed slot back.
 *
 * The quota is claimed before the article is fetched, so that concurrent
 * requests can't both slip past the same check. When the work then fails for a
 * reason that cost us nothing — a dead link, a paywall, a PDF — the caller
 * should not lose one of three daily analyses over it.
 */
async function refundRateLimit(bucket: { key: string; max: number }): Promise<void> {
  const { key } = bucket

  if (redis) {
    try {
      const redisKey = `quanta:rl:${key}`
      const count = await redis.decr(redisKey)
      // decr on an expired key resurrects it at -1 with no TTL; drop it instead.
      if (count <= 0) await redis.del(redisKey)
      return
    } catch (error) {
      console.error('Rate limit refund failed:', error instanceof Error ? error.message : error)
    }
  }

  const stamps = inMemoryStore.get(key)
  if (stamps?.length) {
    stamps.pop()
    inMemoryStore.set(key, stamps)
  }
}

/**
 * The tier is decided here and nowhere else. It used to be read straight off
 * the request body, which meant any caller could switch on the full paid
 * pipeline.
 *
 * Accounts (lib/supabase) are opt-in infrastructure — until Supabase is
 * configured, there is no way for anyone to actually be a paid subscriber, so
 * real tier gating would just mean "free for everyone": a live behavior
 * change nobody asked for the moment this deploys. So: unconfigured →
 * preserve the original behavior (paid for everyone, bounded only by the
 * rate limit) exactly as before this file had any auth awareness. Configured
 * → resolve for real, from the signed-in session's profile.
 */
async function resolveTier(): Promise<{ tier: 'free' | 'paid'; userId: string | null }> {
  if (!isSupabaseConfigured()) return { tier: 'paid', userId: null }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tier: 'free', userId: null }

  const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single()
  return { tier: profile?.tier === 'paid' ? 'paid' : 'free', userId: user.id }
}

function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS, ...(init.headers ?? {}) },
  })
}

/**
 * Every failure carries a stable `code` next to its sentence. Clients used to
 * get only the raw message and render it verbatim, so an internal string like
 * "Groq API error 503" reached the user untranslated.
 */
function fail(code: AnalysisErrorCode, error: string, status: number, headers?: HeadersInit): Response {
  return json({ error, code }, { status, ...(headers ? { headers } : {}) })
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Everything that can be rejected for free is rejected before a quota slot
    // is claimed. A typo'd URL or a two-word paste used to cost the caller one
    // of three daily analyses.
    let body: { articleUrl?: string; articleText?: string; language?: string }
    try {
      body = await request.json() as typeof body
    } catch {
      return fail('bad_request', 'Request body must be valid JSON.', 400)
    }

    const { articleUrl, articleText, language = 'en' } = body ?? {}

    if (!articleUrl && !articleText) {
      return fail('bad_request', 'Either articleUrl or articleText is required', 400)
    }
    if (articleUrl !== undefined && typeof articleUrl !== 'string') {
      return fail('bad_request', 'articleUrl must be a string.', 400)
    }
    if (articleText !== undefined && typeof articleText !== 'string') {
      return fail('bad_request', 'articleText must be a string.', 400)
    }
    if (articleText && articleText.length > MAX_ARTICLE_TEXT_CHARS) {
      return fail(
        'text_too_long',
        `Article text must be under ${MAX_ARTICLE_TEXT_CHARS.toLocaleString('en-US')} characters.`,
        400,
      )
    }
    // Pasted text is checked up front; scraped text can only be checked after
    // the fetch, which is why that case is handled below the quota claim.
    if (!articleUrl && articleText && articleText.trim().length < 100) {
      return fail('text_too_short', 'Article text must be at least 100 characters', 400)
    }

    const { tier, userId } = await resolveTier()
    const bucket = rateLimitBucket(request, userId, tier)
    let remaining: number | null = null
    if (RATE_LIMIT_ENABLED) {
      const rl = await checkRateLimit(bucket)
      if (!rl.ok) {
        return json(
          { error: 'Daily free limit reached. Try again later.', code: 'rate_limited', retryAfter: rl.retryAfter },
          { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
        )
      }
      remaining = rl.remaining
    }

    /** Rejects after the quota was claimed, so it hands the slot back first. */
    const refundAndFail = async (code: AnalysisErrorCode, message: string): Promise<Response> => {
      if (RATE_LIMIT_ENABLED) await refundRateLimit(bucket)
      return fail(code, message, 400)
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
        const { code, message } = describeScrapeFailure(error)
        return refundAndFail(code, message)
      }
    }

    const trimmedText = text.trim()
    if (trimmedText.length < 100) {
      return refundAndFail(
        articleUrl ? 'scrape_failed' : 'text_too_short',
        articleUrl
          ? 'Not enough article text could be read from that page. Try pasting the text instead.'
          : 'Article text must be at least 100 characters',
      )
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
          console.error('Analysis stream failed:', message)
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: message, code: 'analysis_failed' })}\n\n`))
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
    return fail('server_error', 'Something went wrong on our end. Please try again.', 500)
  }
}
