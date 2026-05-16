import type { AnalysisResult, HistoryEntry } from './types'
import { HISTORY_MAX, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from './config'

const KEY_HISTORY = 'quanta_analysis_history'
const KEY_RATE = 'quanta_rate_limit'
const KEY_INSTALL = 'quanta_install_id'

async function getLocal<T>(key: string, fallback: T): Promise<T> {
  const result = await chrome.storage.local.get(key)
  return (result[key] as T) ?? fallback
}

async function setLocal<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value })
}

export async function getInstallId(): Promise<string> {
  let id = await getLocal<string | undefined>(KEY_INSTALL, undefined)
  if (!id) {
    id = crypto.randomUUID()
    await setLocal(KEY_INSTALL, id)
  }
  return id
}

export async function getHistory(): Promise<HistoryEntry[]> {
  return getLocal<HistoryEntry[]>(KEY_HISTORY, [])
}

export async function saveAnalysis(result: AnalysisResult, url?: string): Promise<HistoryEntry> {
  const entry: HistoryEntry = {
    id: String(Date.now()),
    url,
    title: result.metadata.title,
    source: result.metadata.source,
    score: result.overallScore,
    timestamp: Date.now(),
    result,
  }
  const existing = await getHistory()
  const next = [entry, ...existing].slice(0, HISTORY_MAX)
  await setLocal(KEY_HISTORY, next)
  return entry
}

export async function getRateLimitState(): Promise<{ used: number; remaining: number; resetsInMs: number | null }> {
  const stamps = await getLocal<number[]>(KEY_RATE, [])
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const recent = stamps.filter(t => t > cutoff)
  if (recent.length !== stamps.length) await setLocal(KEY_RATE, recent)
  const used = recent.length
  const remaining = Math.max(0, RATE_LIMIT_MAX - used)
  const resetsInMs = recent.length >= RATE_LIMIT_MAX ? (recent[0] + RATE_LIMIT_WINDOW_MS) - now : null
  return { used, remaining, resetsInMs }
}

export async function recordAnalysisAttempt(): Promise<void> {
  const stamps = await getLocal<number[]>(KEY_RATE, [])
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const recent = stamps.filter(t => t > cutoff)
  recent.push(now)
  await setLocal(KEY_RATE, recent)
}
