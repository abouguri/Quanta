import {
  FACT_RISK_PROMPT,
  BIAS_PROMPT,
  SENSATIONALISM_PROMPT,
  RED_FLAGS_PROMPT
} from './prompts'
import { AnalysisResult, RedFlag } from '@/types/analysis'

export type AnalyzeFrame =
  | { type: 'pass'; pass: 1 | 2 | 3 | 4; name: string; progress: number }
  | { type: 'result'; data: AnalysisResult }

async function callGroqAPI(systemPrompt: string, userMessage: string, retries: number = 3): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY environment variable is not set')

  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    })

    if (response.ok) {
      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
      let output = data.choices?.[0]?.message?.content
      if (!output) throw new Error('Groq API returned no output')
      return output.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    }

    if (response.status === 429 && attempt < retries - 1) {
      const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, waitTime))
      continue
    }

    throw new Error(`Groq API error: ${response.status}`)
  }
  throw new Error('Groq API call failed after maximum retries')
}

const PASSES = [
  { pass: 1 as const, name: 'Fact risk',        progress: 5,  prompt: FACT_RISK_PROMPT },
  { pass: 2 as const, name: 'Bias & framing',   progress: 30, prompt: BIAS_PROMPT },
  { pass: 3 as const, name: 'Sensationalism',   progress: 55, prompt: SENSATIONALISM_PROMPT },
  { pass: 4 as const, name: 'Red flags',        progress: 80, prompt: RED_FLAGS_PROMPT },
]

export async function* analyzeArticle(
  articleText: string,
  metadata?: { title?: string; source?: string; author?: string; publishedDate?: string },
  language: string = 'en'
): AsyncGenerator<AnalyzeFrame> {
  const truncatedText = articleText.substring(0, 5000)
  const languageInstruction = language === 'ar' ? 'Respond in Arabic only.' : 'Respond in English only.'
  const user = `Article:\n${truncatedText}`

  const raw: string[] = []
  for (const p of PASSES) {
    yield { type: 'pass', pass: p.pass, name: p.name, progress: p.progress }
    raw.push(await callGroqAPI(p.prompt + '\n' + languageInstruction, user))
  }

  const factRiskData = JSON.parse(raw[0]) as { riskScore: number; issues: string[]; explanation: string }
  const biasData = JSON.parse(raw[1]) as { biasScore: number; biasType: string; evidence: string[]; explanation: string }
  const sensationalismData = JSON.parse(raw[2]) as { sensationalismScore: number; patterns: string[]; examples: string[]; explanation: string }
  const redFlagsData = JSON.parse(raw[3]) as { flags: RedFlag[]; count: number }

  const redFlagsPenalty = redFlagsData.flags.reduce((total, flag) => {
    if (flag.severity === 'high') return total + 10
    if (flag.severity === 'medium') return total + 5
    return total + 2
  }, 0)

  const overallScore = calculateFinalScore({
    factRiskScore: factRiskData.riskScore,
    biasScore: biasData.biasScore,
    sensationalismScore: sensationalismData.sensationalismScore,
    redFlagsPenalty: Math.min(redFlagsPenalty, 100),
  })

  const result: AnalysisResult = {
    factRiskScore: factRiskData.riskScore,
    biasScore: biasData.biasScore,
    sensationalismScore: sensationalismData.sensationalismScore,
    redFlags: redFlagsData.flags,
    overallScore,
    breakdown: {
      factRisk: factRiskData.explanation,
      bias: biasData.explanation,
      sensationalism: sensationalismData.explanation,
    },
    metadata: {
      title: metadata?.title,
      source: metadata?.source,
      author: metadata?.author,
      publishedDate: metadata?.publishedDate,
    },
  }

  yield { type: 'result', data: result }
}

function calculateFinalScore(analysis: {
  factRiskScore: number
  biasScore: number
  sensationalismScore: number
  redFlagsPenalty: number
}): number {
  const weights = { factRisk: 0.5, bias: 0.2, sensationalism: 0.2, redFlags: 0.1 }
  const invertedFactRisk = 100 - analysis.factRiskScore
  const invertedBias = 100 - analysis.biasScore
  const invertedSensationalism = 100 - analysis.sensationalismScore
  const invertedRedFlags = 100 - analysis.redFlagsPenalty
  const weighted =
    invertedFactRisk * weights.factRisk +
    invertedBias * weights.bias +
    invertedSensationalism * weights.sensationalism +
    invertedRedFlags * weights.redFlags
  return Math.max(0, Math.min(100, Math.round(weighted)))
}
