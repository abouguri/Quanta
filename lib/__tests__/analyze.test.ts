import { beforeEach, describe, expect, it, vi } from 'vitest'
import { analyzeArticle, type AnalyzeFrame } from '@/lib/analyze'

const CLAIM = {
  text: 'The city opened 12 new clinics in 2024.',
  claimant: 'the article',
  context: 'central evidence for the article',
  topic: 'health',
}

function mockGroqResponses(...payloads: unknown[]) {
  let i = 0
  return vi.fn(async () => {
    const body = JSON.stringify(payloads[i++])
    return new Response(JSON.stringify({ choices: [{ message: { content: body } }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

describe('analyzeArticle', () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key'
    delete process.env.GOOGLE_FACT_CHECK_API_KEY
    delete process.env.BRAVE_SEARCH_API_KEY
    vi.restoreAllMocks()
  })

  it('emits structural-only results for the free tier', async () => {
    const frames: AnalyzeFrame[] = []

    for await (const frame of analyzeArticle(
      'A carefully reported article with enough words to pass the minimum structural checks.'.repeat(5),
      { title: 'Clinic expansion', source: 'example.com', author: 'Reporter', publishedDate: '2026-01-01' },
      'free',
    )) {
      frames.push(frame)
    }

    expect(frames.map(f => f.type)).toEqual(['step', 'result'])
    expect(frames[0]).toMatchObject({ type: 'step', step: 'structural', progress: 10 })
    expect(frames[1]).toMatchObject({
      type: 'result',
      data: {
        version: 2,
        tier: 'free',
        overallScore: 100,
        metadata: { title: 'Clinic expansion', source: 'example.com' },
      },
    })
  })

  it('extracts and synthesizes claims for the paid tier', async () => {
    vi.stubGlobal('fetch', mockGroqResponses(
      { claims: [CLAIM] },
      { verdict: 'FALSE', confidence: 'medium', reasoning: 'The known record does not support this claim.' },
    ))

    const frames: AnalyzeFrame[] = []
    for await (const frame of analyzeArticle(
      'The city opened 12 new clinics in 2024. Officials said the program reduced wait times.'.repeat(5),
      { title: 'Clinic expansion', source: 'example.com', author: 'Reporter', publishedDate: '2026-01-01' },
      'paid',
      'en',
    )) {
      frames.push(frame)
    }

    expect(frames.map(f => f.type)).toEqual(['step', 'step', 'step', 'result'])
    expect(frames.filter(f => f.type === 'step').map(f => f.step)).toEqual([
      'structural',
      'extracting',
      'claim_1',
    ])

    const last = frames[frames.length - 1]
    expect(last.type).toBe('result')
    if (last.type !== 'result') throw new Error('unreachable')

    expect(last.data).toMatchObject({
      version: 2,
      tier: 'paid',
      overallScore: 58,
      structural: { score: 100, flags: [] },
      claims: [
        {
          claim: CLAIM,
          verdict: 'FALSE',
          confidence: 'medium',
          source: 'llm_assessment',
          summary: 'The known record does not support this claim.',
        },
      ],
    })
  })

  it('throws if GROQ_API_KEY is unset for paid analysis', async () => {
    delete process.env.GROQ_API_KEY

    await expect(async () => {
      const gen = analyzeArticle('A sufficiently long article text.'.repeat(20), {}, 'paid')
      while (!(await gen.next()).done) { /* drain */ }
    }).rejects.toThrow(/GROQ_API_KEY/)
  })
})
