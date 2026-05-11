import {
  FACT_RISK_PROMPT,
  BIAS_PROMPT,
  SENSATIONALISM_PROMPT,
  RED_FLAGS_PROMPT
} from './prompts'
import { AnalysisResult, RedFlag } from '@/types/analysis'

async function callGroqAPI(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
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

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`Groq API error: ${response.status}`)
      console.error('Response:', errorData)
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const output = data.choices?.[0]?.message?.content

    if (!output) {
      throw new Error('Groq API returned no output')
    }

    return output
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Groq API call failed:', message)
    throw error
  }
}

export async function analyzeArticle(
  articleText: string,
  metadata?: { title?: string; source?: string; author?: string; publishedDate?: string }
): Promise<AnalysisResult> {
  const truncatedText = articleText.substring(0, 5000)

  try {
    console.log('Starting multi-pass analysis...')

    // Pass 1: Fact Risk
    console.log('Pass 1: Analyzing fact risk...')
    const factRiskResponse = await callGroqAPI(
      FACT_RISK_PROMPT,
      `Article:\n${truncatedText}`
    )
    const factRiskData = JSON.parse(factRiskResponse) as {
      riskScore: number
      issues: string[]
      explanation: string
    }

    // Pass 2: Bias Detection
    console.log('Pass 2: Detecting bias...')
    const biasResponse = await callGroqAPI(
      BIAS_PROMPT,
      `Article:\n${truncatedText}`
    )
    const biasData = JSON.parse(biasResponse) as {
      biasScore: number
      biasType: string
      evidence: string[]
      explanation: string
    }

    // Pass 3: Sensationalism
    console.log('Pass 3: Analyzing sensationalism...')
    const sensationalismResponse = await callGroqAPI(
      SENSATIONALISM_PROMPT,
      `Article:\n${truncatedText}`
    )
    const sensationalismData = JSON.parse(sensationalismResponse) as {
      sensationalismScore: number
      patterns: string[]
      examples: string[]
      explanation: string
    }

    // Pass 4: Red Flags
    console.log('Pass 4: Identifying red flags...')
    const redFlagsResponse = await callGroqAPI(
      RED_FLAGS_PROMPT,
      `Article:\n${truncatedText}`
    )
    const redFlagsData = JSON.parse(redFlagsResponse) as {
      flags: RedFlag[]
      count: number
    }

    // Calculate penalty for red flags (each high flag = 10 points, medium = 5, low = 2)
    const redFlagsPenalty = redFlagsData.flags.reduce((total, flag) => {
      if (flag.severity === 'high') return total + 10
      if (flag.severity === 'medium') return total + 5
      return total + 2
    }, 0)

    // Calculate overall score
    const overallScore = calculateFinalScore({
      factRiskScore: factRiskData.riskScore,
      biasScore: biasData.biasScore,
      sensationalismScore: sensationalismData.sensationalismScore,
      redFlagsPenalty: Math.min(redFlagsPenalty, 100), // Cap at 100
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

    console.log('Analysis complete')
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Analysis failed:', message)
    throw error
  }
}

function calculateFinalScore(analysis: {
  factRiskScore: number
  biasScore: number
  sensationalismScore: number
  redFlagsPenalty: number
}): number {
  const weights = {
    factRisk: 0.5,
    bias: 0.2,
    sensationalism: 0.2,
    redFlags: 0.1,
  }

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
