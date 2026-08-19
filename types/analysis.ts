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

/**
 * Stable machine-readable reasons a request can fail. Clients switch on these
 * to show a translated message; the accompanying `error` string stays as the
 * fallback for codes a client does not know.
 */
export type AnalysisErrorCode =
  | 'bad_request'
  | 'url_invalid'
  | 'text_too_short'
  | 'text_too_long'
  | 'fetch_failed'
  | 'scrape_failed'
  | 'rate_limited'
  | 'analysis_failed'
  | 'server_error'

export interface AnalysisErrorBody {
  error: string
  code: AnalysisErrorCode
  retryAfter?: number
}
