import { beforeEach, describe, expect, it, vi } from 'vitest'
import { callGroq, GroqError, parseJsonResponse, stripCodeFence } from '@/lib/groq'

function ok(content: string): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function err(status: number): Response {
  return new Response('upstream said no', { status })
}

describe('callGroq', () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.restoreAllMocks()
  })

  it('retries a 429 and returns the eventual success', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(err(429))
      .mockResolvedValueOnce(ok('{"ok":true}'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(callGroq('system', 'user')).resolves.toBe('{"ok":true}')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries a network failure', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValueOnce(ok('done'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(callGroq('system', 'user')).resolves.toBe('done')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('gives up after the attempt budget', async () => {
    const fetchMock = vi.fn().mockResolvedValue(err(503))
    vi.stubGlobal('fetch', fetchMock)

    await expect(callGroq('system', 'user')).rejects.toThrow(/503/)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not retry a client error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(err(400))
    vi.stubGlobal('fetch', fetchMock)

    await expect(callGroq('system', 'user')).rejects.toThrow(GroqError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('throws a non-retryable error when the key is missing', async () => {
    delete process.env.GROQ_API_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(callGroq('system', 'user')).rejects.toThrow(/GROQ_API_KEY/)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('strips markdown fences the model adds despite the prompt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok('```json\n{"claims":[]}\n```')))
    await expect(callGroq('system', 'user')).resolves.toBe('{"claims":[]}')
  })
})

describe('parseJsonResponse', () => {
  it('parses clean JSON', () => {
    expect(parseJsonResponse<{ a: number }>('{"a":1}')).toEqual({ a: 1 })
  })

  it('recovers JSON wrapped in prose', () => {
    expect(parseJsonResponse('Here you go: {"a":1} — hope that helps')).toEqual({ a: 1 })
  })

  it('returns null when there is no JSON to find', () => {
    expect(parseJsonResponse('I cannot help with that.')).toBeNull()
  })
})

describe('stripCodeFence', () => {
  it('leaves unfenced text alone', () => {
    expect(stripCodeFence('  {"a":1}  ')).toBe('{"a":1}')
  })
})
