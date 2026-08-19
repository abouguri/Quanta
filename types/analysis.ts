export interface Claim {
  text: string
  claimant?: string
  context: string
  topic: string
}

export type Verdict = 'TRUE' | 'FALSE' | 'MISLEADING' | 'MIXED' | 'UNVERIFIED'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface FactCheckResult {
  claim: Claim
  verdict: Verdict
  confidence: ConfidenceLevel
  source: 'factcheck_db' | 'web_search' | 'llm_assessment'
  factCheckUrl?: string
  factCheckPublisher?: string
  factCheckRating?: string
  summary: string
}

export interface StructuralFlag {
  type: string
  severity: 'high' | 'medium' | 'low'
  description: string
}

export interface StructuralAnalysis {
  score: number
  flags: StructuralFlag[]
  metrics: {
    hasAuthor: boolean
    hasDate: boolean
    capsRatio: number
    exclamationDensity: number
    suspiciousDomain: boolean
    articleLength: number
  }
}

export interface AnalysisResult {
  version: 2
  tier: 'free' | 'paid'
  overallScore: number
  /**
   * When the analysis ran, epoch ms. Optional because reports saved before
   * this field existed are still valid v2 results.
   */
  analyzedAt?: number
  structural: StructuralAnalysis
  claims?: FactCheckResult[]
  metadata: {
    title?: string
    source?: string
    author?: string
    publishedDate?: string
  }
}

export interface ScrapedArticle {
  title?: string
  text: string
  author?: string
  publishedDate?: string
  source?: string
}
