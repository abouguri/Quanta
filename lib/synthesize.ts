import { Claim, FactCheckResult } from '@/types/analysis'
import { SYNTHESIS_PROMPT } from './prompts'
import { callGroq, parseJsonResponse } from './groq'

const VERDICTS = new Set(['TRUE', 'FALSE', 'MISLEADING', 'MIXED', 'UNVERIFIED'])
const CONFIDENCES = new Set(['high', 'medium', 'low'])

/**
 * Last resort for claims no fact-checker has covered. Never throws: an
 * unusable assessment degrades to UNVERIFIED so one bad claim can't sink the
 * whole report.
 */
export async function synthesizeClaim(claim: Claim, articleContext: string): Promise<FactCheckResult> {
  const context = articleContext.substring(0, 800)
  const userMessage = `Claim: "${claim.text}"\n\nArticle context (excerpt):\n${context}`

  const unverified = (summary: string): FactCheckResult => ({
    claim,
    verdict: 'UNVERIFIED',
    confidence: 'low',
    source: 'llm_assessment',
    summary,
  })

  try {
    const raw = await callGroq(SYNTHESIS_PROMPT, userMessage, { maxTokens: 512 })
    const parsed = parseJsonResponse<{ verdict: string; confidence: string; reasoning: string }>(raw)

    if (!parsed || !VERDICTS.has(parsed.verdict)) {
      return unverified('No independent fact-check found, and the assessment could not be parsed.')
    }

    return {
      claim,
      verdict: parsed.verdict as FactCheckResult['verdict'],
      confidence: CONFIDENCES.has(parsed.confidence) ? parsed.confidence as FactCheckResult['confidence'] : 'low',
      source: 'llm_assessment',
      summary: parsed.reasoning || 'No reasoning returned.',
    }
  } catch {
    return unverified('No independent fact-check found. Assessment unavailable.')
  }
}
