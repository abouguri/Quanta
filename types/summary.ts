export interface SummaryResponse {
  headline: string
  bullets: string[]
  bottom_line: string
  tone: 'neutral' | 'mixed' | 'heated'
  freshness: string
  sources: { title: string; url: string }[]
}
