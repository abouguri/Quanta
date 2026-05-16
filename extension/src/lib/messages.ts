import type { AnalysisResult, ExtractedArticle } from './types'

// content <-> popup
export type ContentMessage = { type: 'EXTRACT' }
export type ContentResponse = ExtractedArticle | null

// popup <-> background (long-lived port)
export type PopupToBackground =
  | { type: 'START'; payload: { articleText: string; articleUrl?: string; language?: string; installId: string } }
  | { type: 'CANCEL' }

export type BackgroundToPopup =
  | { type: 'PROGRESS'; status: string; progress: number }
  | { type: 'RESULT'; data: AnalysisResult }
  | { type: 'ERROR'; message: string; retryAfter?: number; status?: number }

export const ANALYZE_PORT = 'analyze'
