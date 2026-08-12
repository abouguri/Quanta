import { AnalysisResult, FactCheckResult } from '@/types/analysis'
import { analyzeStructure } from './structural'
import { extractClaims } from './claims'
import { findFactCheck } from './factcheck'
import { synthesizeClaim } from './synthesize'

export type AnalyzeFrame =
  | { type: 'step'; step: string; label: string; progress: number }
  | { type: 'result'; data: AnalysisResult }

const VERDICT_PENALTY: Record<string, number> = {
  FALSE: 60,
  MISLEADING: 40,
  MIXED: 20,
  UNVERIFIED: 10,
  TRUE: 0,
}

function calculateOverallScore(
  structuralScore: number,
  claims: FactCheckResult[],
  tier: 'free' | 'paid',
): number {
  if (tier === 'free' || claims.length === 0) return structuralScore

  const avgPenalty =
    claims.reduce((acc, c) => acc + (VERDICT_PENALTY[c.verdict] ?? 10), 0) / claims.length
  const claimScore = Math.max(0, 100 - avgPenalty)

  return Math.round(structuralScore * 0.3 + claimScore * 0.7)
}

export async function* analyzeArticle(
  articleText: string,
  metadata: { title?: string; source?: string; author?: string; publishedDate?: string } = {},
  tier: 'free' | 'paid' = 'free',
  language: string = 'en',
): AsyncGenerator<AnalyzeFrame> {

  yield { type: 'step', step: 'structural', label: 'Structural analysis', progress: 10 }
  const structural = analyzeStructure(articleText, metadata)

  if (tier === 'free') {
    yield {
      type: 'result',
      data: {
        version: 2,
        tier: 'free',
        overallScore: structural.score,
        structural,
        metadata,
      },
    }
    return
  }

  yield { type: 'step', step: 'extracting', label: 'Extracting claims', progress: 25 }
  const claims = await extractClaims(articleText, language)

  const results: FactCheckResult[] = []
  for (let i = 0; i < claims.length; i++) {
    yield {
      type: 'step',
      step: `claim_${i + 1}`,
      label: `Verifying claim ${i + 1} of ${claims.length}`,
      progress: 35 + Math.round((i / claims.length) * 55),
    }

    const fcResult = await findFactCheck(claims[i])
    if (fcResult) {
      results.push(fcResult)
    } else {
      const synthesized = await synthesizeClaim(claims[i], articleText)
      results.push(synthesized)
    }
  }

  const overallScore = calculateOverallScore(structural.score, results, 'paid')

  yield {
    type: 'result',
    data: {
      version: 2,
      tier: 'paid',
      overallScore,
      structural,
      claims: results,
      metadata,
    },
  }
}
