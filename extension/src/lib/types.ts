// Mirror of /tmp/abougui/factnews/types/analysis.ts — keep in sync.
export interface RedFlag {
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
}

export interface AnalysisResult {
  factRiskScore: number
  biasScore: number
  sensationalismScore: number
  redFlags: RedFlag[]
  overallScore: number
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
