export interface RedFlag {
  type: string
  severity: 'high' | 'medium' | 'low'
  description: string
}

export interface AnalysisResult {
  factRiskScore: number // 0-100 (higher = more risky)
  biasScore: number // 0-100 (higher = more biased)
  sensationalismScore: number // 0-100 (higher = more sensationalist)
  redFlags: RedFlag[]
  overallScore: number // 0-100 (higher = more credible)
  breakdown: {
    factRisk: string
    bias: string
    sensationalism: string
  }
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
