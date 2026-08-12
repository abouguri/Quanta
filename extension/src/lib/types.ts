// Mirror of ../../../types/analysis.ts — keep in sync.
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

export type RedFlag = StructuralFlag

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
  structural: StructuralAnalysis
  claims?: FactCheckResult[]
  metadata: {
    title?: string
    source?: string
    author?: string
    publishedDate?: string
  }
}

export interface ExtractedArticle {
  title: string | null
  byline: string | null
  content: string | null
  textContent: string
  length: number
  siteName: string | null
  excerpt: string | null
  lang: string | null
  url: string
}

export interface HistoryEntry {
  id: string
  url?: string
  title?: string
  source?: string
  score: number
  timestamp: number
  result: AnalysisResult
}
