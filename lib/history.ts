import { AnalysisResult } from '@/types/analysis'

export interface AnalysisHistory {
  id: string
  url?: string
  title?: string
  score: number
  date: number
  result: AnalysisResult
}

const HISTORY_KEY = 'quanta_analysis_history'
const MAX_HISTORY = 50

export function saveAnalysis(
  result: AnalysisResult,
  url?: string
): AnalysisHistory {
  if (typeof window === 'undefined') return null as any

  const history = getHistory()
  const entry: AnalysisHistory = {
    id: Date.now().toString(),
    url: url,
    title: result.metadata.title,
    score: result.overallScore,
    date: Date.now(),
    result,
  }

  // Add to front and keep only MAX_HISTORY
  history.unshift(entry)
  if (history.length > MAX_HISTORY) {
    history.pop()
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return entry
}

export function getHistory(): AnalysisHistory[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem(HISTORY_KEY)
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === 'undefined') return

  const history = getHistory()
  const filtered = history.filter(entry => entry.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
}

export function getHistoryStats() {
  const history = getHistory()
  if (!history.length) {
    return {
      total: 0,
      average: 0,
      highRisk: 0,
      reliable: 0,
    }
  }

  const scores = history.map(h => h.score)
  const average = Math.round(scores.reduce((a, b) => a + b) / scores.length)
  const highRisk = history.filter(h => h.score < 40).length
  const reliable = history.filter(h => h.score >= 80).length

  return {
    total: history.length,
    average,
    highRisk,
    reliable,
  }
}
