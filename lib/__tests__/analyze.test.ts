import { describe, expect, it, beforeEach, vi } from 'vitest'
import { analyzeArticle, type AnalyzeFrame } from '@/lib/analyze'

const FACT_RISK = { riskScore: 30, issues: ['no primary source'], explanation: 'mostly cited; 1 claim uncited' }
const BIAS = { biasScore: 40, biasType: 'lean-left', evidence: [], explanation: 'minor framing tilt' }
const SENSATIONALISM = { sensationalismScore: 20, patterns: [], examples: [], explanation: 'measured tone' }
const RED_FLAGS = {
  flags: [
    { type: 'Unverified claim', severity: 'medium', description: 'one quote attributed without source' },
  ],
  count: 1,
}

const RESPONSES = [FACT_RISK, BIAS, SENSATIONALISM, RED_FLAGS]

function mockFetchSequence() {
  let i = 0
  return vi.fn(async () => {
    const body = JSON.stringify(RESPONSES[i++])
    return new Response(JSON.stringify({ choices: [{ message: { content: body } }] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

describe('analyzeArticle', () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key'
    vi.stubGlobal('fetch', mockFetchSequence())
  })

  it('emits 4 pass frames then a result frame in order', async () => {
    const frames: AnalyzeFrame[] = []
    for await (const f of analyzeArticle('a'.repeat(300), { title: 'T', source: 's.com' }, 'en')) {
      frames.push(f)
    }
    const types = frames.map(f => f.type)
    expect(types).toEqual(['pass', 'pass', 'pass', 'pass', 'result'])
    const passNumbers = frames.filter(f => f.type === 'pass').map(f => (f as Extract<AnalyzeFrame, { type: 'pass' }>).pass)
    expect(passNumbers).toEqual([1, 2, 3, 4])
  })

  it('result payload has the expected AnalysisResult shape', async () => {
    const frames: AnalyzeFrame[] = []
    for await (const f of analyzeArticle('a'.repeat(300), { title: 'T', source: 's.com' }, 'en')) {
      frames.push(f)
    }
    const last = frames[frames.length - 1]
    expect(last.type).toBe('result')
    if (last.type !== 'result') throw new Error('unreachable')
    const r = last.data
    expect(r.factRiskScore).toBe(FACT_RISK.riskScore)
    expect(r.biasScore).toBe(BIAS.biasScore)
    expect(r.sensationalismScore).toBe(SENSATIONALISM.sensationalismScore)
    expect(r.redFlags).toHaveLength(1)
    expect(r.overallScore).toBeGreaterThanOrEqual(0)
    expect(r.overallScore).toBeLessThanOrEqual(100)
    expect(r.breakdown.factRisk).toBe(FACT_RISK.explanation)
    expect(r.breakdown.bias).toBe(BIAS.explanation)
    expect(r.breakdown.sensationalism).toBe(SENSATIONALISM.explanation)
    expect(r.metadata.title).toBe('T')
    expect(r.metadata.source).toBe('s.com')
  })

  it('throws if GROQ_API_KEY is unset', async () => {
    delete process.env.GROQ_API_KEY
    await expect(async () => {
      const gen = analyzeArticle('a'.repeat(300))
      while (!(await gen.next()).done) { /* drain */ }
    }).rejects.toThrow(/GROQ_API_KEY/)
  })
})
