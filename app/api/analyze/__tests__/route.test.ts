import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const lookup = vi.hoisted(() => vi.fn())
vi.mock('dns/promises', () => ({ lookup }))

const PUBLIC = [{ address: '93.184.216.34' }]

const LONG_TEXT =
  'The council approved the transit funding package on Tuesday afternoon. '.repeat(4)

const ARTICLE_HTML = `<html><body><h1>Transit funding approved</h1><article>
  <span rel="author">Dana Reporter</span><time datetime="2026-03-04">March 4</time>
  <p>${'The council approved the funding package after a long debate. '.repeat(10)}</p>
</article></body></html>`

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://quanta.test/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

/** The route reads NODE_ENV at module load, so each mode needs a fresh import. */
async function loadRoute(nodeEnv: 'test' | 'production') {
  vi.resetModules()
  vi.stubEnv('NODE_ENV', nodeEnv)
  return import('../route')
}

/** Drains an SSE body into the frames it carried. */
async function readFrames(response: Response): Promise<Array<Record<string, any>>> {
  const text = await response.text()
  return text
    .split('\n\n')
    .filter(f => f.startsWith('data: '))
    .map(f => JSON.parse(f.slice(6)))
}

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    lookup.mockReset()
    lookup.mockResolvedValue(PUBLIC)
    process.env.GROQ_API_KEY = 'test-key'
    delete process.env.GOOGLE_FACT_CHECK_API_KEY
    delete process.env.BRAVE_SEARCH_API_KEY
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('validation', () => {
    it('rejects a body that is not JSON', async () => {
      const { POST } = await loadRoute('test')
      const response = await POST(post('not json at all'))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({ code: 'bad_request' })
    })

    it('requires one of articleUrl or articleText', async () => {
      const { POST } = await loadRoute('test')
      const response = await POST(post({}))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({ code: 'bad_request' })
    })

    it('rejects wrong-typed fields', async () => {
      const { POST } = await loadRoute('test')
      await expect((await POST(post({ articleUrl: 42 }))).json()).resolves.toMatchObject({
        code: 'bad_request',
      })
      await expect((await POST(post({ articleText: { a: 1 } }))).json()).resolves.toMatchObject({
        code: 'bad_request',
      })
    })

    it('rejects text under the minimum', async () => {
      const { POST } = await loadRoute('test')
      const response = await POST(post({ articleText: 'too short' }))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({ code: 'text_too_short' })
    })

    it('rejects text over the maximum', async () => {
      const { POST } = await loadRoute('test')
      const response = await POST(post({ articleText: 'x'.repeat(50_001) }))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({ code: 'text_too_long' })
    })

    it('refuses a URL pointing at a private address', async () => {
      const { POST } = await loadRoute('test')
      const response = await POST(post({ articleUrl: 'http://169.254.169.254/latest/meta-data/' }))

      expect(response.status).toBe(400)
      await expect(response.json()).resolves.toMatchObject({ code: 'url_invalid' })
    })

    it('reports a failed scrape with a code, not a raw stack', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('gone', { status: 404 })))
      const { POST } = await loadRoute('test')
      const response = await POST(post({ articleUrl: 'https://news.example.com/gone' }))

      const body = await response.json()
      expect(response.status).toBe(400)
      expect(body.code).toBe('scrape_failed')
      expect(body.error).not.toMatch(/Failed to scrape article: Failed to scrape/)
    })
  })

  describe('streaming', () => {
    it('streams step frames and a final v2 result', async () => {
      vi.stubGlobal('fetch', vi.fn(async () =>
        new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ claims: [] }) } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ))

      const { POST } = await loadRoute('test')
      const response = await POST(post({ articleText: LONG_TEXT }))

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/event-stream')

      const frames = await readFrames(response)
      expect(frames[0]).toMatchObject({ step: 'structural' })
      expect(frames.at(-1)).toMatchObject({ version: 2, tier: 'paid' })
      expect(frames.at(-1)!.analyzedAt).toBeTypeOf('number')
    })

    it('scrapes a URL and carries its metadata into the result', async () => {
      const fetchMock = vi.fn(async (input: any) => {
        if (String(input).includes('news.example.com')) {
          return new Response(ARTICLE_HTML, {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          })
        }
        return new Response(JSON.stringify({ choices: [{ message: { content: '{"claims":[]}' } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      })
      vi.stubGlobal('fetch', fetchMock)

      const { POST } = await loadRoute('test')
      const response = await POST(post({ articleUrl: 'https://news.example.com/transit' }))
      const frames = await readFrames(response)

      expect(frames.at(-1)).toMatchObject({
        version: 2,
        metadata: { title: 'Transit funding approved', author: 'Dana Reporter', source: 'news.example.com' },
      })
    })

    it('reports a mid-stream failure as an error frame rather than a dropped stream', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 400 })))

      const { POST } = await loadRoute('test')
      const response = await POST(post({ articleText: LONG_TEXT }))

      // The 200 is already committed by the time analysis fails, so the failure
      // has to travel in-band.
      expect(response.status).toBe(200)
      const frames = await readFrames(response)
      expect(frames.at(-1)).toMatchObject({ code: 'analysis_failed' })
    })
  })

  describe('rate limiting', () => {
    const groqOk = () =>
      vi.fn(async () =>
        new Response(JSON.stringify({ choices: [{ message: { content: '{"claims":[]}' } }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

    it('is off outside production', async () => {
      vi.stubGlobal('fetch', groqOk())
      const { POST } = await loadRoute('test')

      for (let i = 0; i < 5; i++) {
        const response = await POST(post({ articleText: LONG_TEXT }, { 'X-Quanta-Install-Id': 'dev' }))
        expect(response.status).toBe(200)
      }
    })

    it('allows three analyses per install, then 429s with a code', async () => {
      vi.stubGlobal('fetch', groqOk())
      const { POST } = await loadRoute('production')
      const headers = { 'X-Quanta-Install-Id': 'install-a' }

      for (let i = 0; i < 3; i++) {
        const response = await POST(post({ articleText: LONG_TEXT }, headers))
        expect(response.status).toBe(200)
        expect(response.headers.get('X-RateLimit-Remaining')).toBe(String(2 - i))
        await response.text()
      }

      const blocked = await POST(post({ articleText: LONG_TEXT }, headers))
      expect(blocked.status).toBe(429)
      expect(blocked.headers.get('Retry-After')).toBeTruthy()
      await expect(blocked.json()).resolves.toMatchObject({ code: 'rate_limited' })
    })

    it('buckets installs separately', async () => {
      vi.stubGlobal('fetch', groqOk())
      const { POST } = await loadRoute('production')

      for (let i = 0; i < 3; i++) {
        await (await POST(post({ articleText: LONG_TEXT }, { 'X-Quanta-Install-Id': 'install-b' }))).text()
      }

      const other = await POST(post({ articleText: LONG_TEXT }, { 'X-Quanta-Install-Id': 'install-c' }))
      expect(other.status).toBe(200)
    })

    it('falls back to a more generous IP bucket without an install ID', async () => {
      vi.stubGlobal('fetch', groqOk())
      const { POST } = await loadRoute('production')
      const headers = { 'x-forwarded-for': '203.0.113.9' }

      for (let i = 0; i < 10; i++) {
        const response = await POST(post({ articleText: LONG_TEXT }, headers))
        expect(response.status).toBe(200)
        await response.text()
      }

      expect((await POST(post({ articleText: LONG_TEXT }, headers))).status).toBe(429)
    })

    it('does not charge a slot for input it rejected', async () => {
      vi.stubGlobal('fetch', groqOk())
      const { POST } = await loadRoute('production')
      const headers = { 'X-Quanta-Install-Id': 'install-d' }

      for (let i = 0; i < 5; i++) {
        expect((await POST(post({ articleText: 'nope' }, headers))).status).toBe(400)
      }

      const response = await POST(post({ articleText: LONG_TEXT }, headers))
      expect(response.status).toBe(200)
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('2')
    })

    it('refunds the slot when the article cannot be fetched', async () => {
      // The quota is claimed before the scrape, so a dead link has to give it
      // back rather than cost one of three daily analyses.
      const fetchMock = vi.fn(async (input: any) =>
        String(input).includes('news.example.com')
          ? new Response('gone', { status: 404 })
          : new Response(JSON.stringify({ choices: [{ message: { content: '{"claims":[]}' } }] }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
      )
      vi.stubGlobal('fetch', fetchMock)

      const { POST } = await loadRoute('production')
      const headers = { 'X-Quanta-Install-Id': 'install-e' }

      for (let i = 0; i < 4; i++) {
        expect((await POST(post({ articleUrl: 'https://news.example.com/gone' }, headers))).status).toBe(400)
      }

      const response = await POST(post({ articleText: LONG_TEXT }, headers))
      expect(response.status).toBe(200)
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('2')
    })
  })

  it('answers a CORS preflight', async () => {
    const { OPTIONS } = await loadRoute('test')
    const response = OPTIONS()

    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-Quanta-Install-Id')
  })
})
