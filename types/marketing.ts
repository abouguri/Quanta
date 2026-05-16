/**
 * Marketing site data types for easy integration
 * Update these to connect to real data sources
 */

export interface SignalDimension {
  label: string
  value: number
  tone: 'verified' | 'mixed' | 'disputed' | 'unclear'
}

export interface ArticleAnalysis {
  url: string
  headline: string
  host: string
  author: string
  published: string
  readTime: string
  overall: number
  confidence: number
  signal: 'verified' | 'mixed' | 'disputed' | 'unclear'
  dimensions: SignalDimension[]
  summary: string
}

export interface SignalCard {
  code: string
  name: string
  short: string
  detail: string
  sample: Record<string, number | string>
  tone: 'verified' | 'mixed'
}

export interface ComparisonRow {
  host: string
  headline: string
  score: number
  framing: string
  tone: 'verified' | 'mixed' | 'disputed'
}

export interface MarketingStats {
  articlesMeasured: number
  outletsIndexed: number
  languages: number
  medianAnalysisTime: string
}

export interface MarketingPageData {
  stats: MarketingStats
  featuredAnalyses: ArticleAnalysis[]
  signals: SignalCard[]
  comparisons: ComparisonRow[]
  methodology: {
    principles: Array<{ title: string; description: string }>
    example: {
      sentence: string
      attribution: string
      metrics: Array<{ code: string; name: string; value: number }>
    }
  }
}
