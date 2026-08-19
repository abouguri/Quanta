const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const MAX_ATTEMPTS = 3
const BASE_BACKOFF_MS = 400

// A stalled connection is indistinguishable from a slow one from here, and the
// analysis streams claim-by-claim — a single hung call would otherwise hold the
// whole report open until the platform's function timeout kills it.
const REQUEST_TIMEOUT_MS = 30_000

/** Thrown when Groq is reachable but the response can't be used. */
export class GroqError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message)
    this.name = 'GroqError'
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 429 and 5xx are transient — Groq's free tier throttles in bursts, and a single
// hiccup used to kill an entire analysis mid-stream.
const isRetryableStatus = (status: number) => status === 429 || status >= 500

function backoffMs(attempt: number, retryAfterHeader: string | null): number {
  const retryAfter = Number(retryAfterHeader)
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, 5000)
  return BASE_BACKOFF_MS * 2 ** attempt
}

/**
 * Calls Groq and returns the raw assistant message, retrying transient
 * failures. Markdown code fences are stripped — the model wraps JSON in them
 * intermittently despite the prompts forbidding it.
 */
export async function callGroq(
  systemPrompt: string,
  userMessage: string,
  options: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new GroqError('GROQ_API_KEY is not set', false)

  const body = JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 1024,
  })

  let lastError: GroqError = new GroqError('Groq request never ran', false)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(backoffMs(attempt - 1, null))

    let response: Response
    try {
      response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
    } catch (err) {
      // Network-level failure — always worth another attempt.
      lastError = new GroqError(`Groq request failed: ${err instanceof Error ? err.message : 'network error'}`, true)
      continue
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      const retryable = isRetryableStatus(response.status)
      lastError = new GroqError(`Groq API error ${response.status}: ${detail.slice(0, 200)}`, retryable)
      if (!retryable) throw lastError
      if (attempt < MAX_ATTEMPTS - 1) await sleep(backoffMs(attempt, response.headers.get('retry-after')))
      continue
    }

    let data: { choices?: Array<{ message?: { content?: string } }> }
    try {
      data = await response.json() as typeof data
    } catch {
      // A truncated or non-JSON 200 used to throw straight out of the retry
      // loop, skipping the attempts we had left.
      lastError = new GroqError('Groq API returned an unreadable body', true)
      continue
    }

    const text = data.choices?.[0]?.message?.content
    if (!text) {
      lastError = new GroqError('Groq API returned no output', true)
      continue
    }

    return stripCodeFence(text)
  }

  throw lastError
}

export function stripCodeFence(text: string): string {
  return text
    .replace(/^\s*```(?:json)?\s*\n?/i, '')
    .replace(/\n?\s*```\s*$/, '')
    .trim()
}

/**
 * Parses model output as JSON, falling back to the outermost {...} block when
 * the model prefixes prose. Returns null instead of throwing so callers can
 * decide whether a malformed response is fatal.
 */
export function parseJsonResponse<T>(raw: string): T | null {
  const candidates = [raw]
  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace > 0 && lastBrace > firstBrace) candidates.push(raw.slice(firstBrace, lastBrace + 1))

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T
    } catch {
      continue
    }
  }
  return null
}
