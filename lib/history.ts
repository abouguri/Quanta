import { AnalysisResult } from '@/types/analysis'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

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

/**
 * Every function here is dual-mode: signed in and Supabase configured →
 * reads/writes the `analyses` table (RLS-scoped to the caller's own rows,
 * enforced server-side regardless of what the client asks for). Otherwise →
 * the exact localStorage behavior this module always had. Anonymous users
 * get no regression; accounts get server-side history that follows them
 * across devices.
 */
async function getSignedInUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

interface AnalysisRow {
  id: string
  url: string | null
  title: string | null
  score: number
  result: AnalysisResult
  created_at: string
}

function rowToEntry(row: AnalysisRow): AnalysisHistory {
  return {
    id: row.id,
    url: row.url ?? undefined,
    title: row.title ?? undefined,
    score: row.score,
    date: new Date(row.created_at).getTime(),
    result: row.result,
  }
}

export async function saveAnalysis(
  result: AnalysisResult,
  url?: string
): Promise<AnalysisHistory | null> {
  const userId = await getSignedInUserId()

  if (userId) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('analyses')
      .insert({ user_id: userId, url, title: result.metadata.title, score: result.overallScore, result })
      .select('id, url, title, score, result, created_at')
      .single()
    if (error || !data) return null
    return rowToEntry(data as AnalysisRow)
  }

  if (typeof localStorage === 'undefined') return null

  const history = await getLocalHistory()
  const entry: AnalysisHistory = {
    id: newEntryId(),
    url: url,
    title: result.metadata.title,
    score: result.overallScore,
    date: result.analyzedAt ?? Date.now(),
    result,
  }

  history.unshift(entry)
  if (history.length > MAX_HISTORY) {
    history.pop()
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // Quota exceeded or private mode — the report on screen is unaffected.
    return null
  }
  return entry
}

/** Date.now() alone collides for two analyses saved in the same millisecond. */
function newEntryId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

export async function getHistory(): Promise<AnalysisHistory[]> {
  const userId = await getSignedInUserId()

  if (userId) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('analyses')
      .select('id, url, title, score, result, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY)
    if (error || !data) return []
    return (data as AnalysisRow[]).map(rowToEntry)
  }

  return getLocalHistory()
}

async function getLocalHistory(): Promise<AnalysisHistory[]> {
  if (typeof localStorage === 'undefined') return []

  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    const parsed: AnalysisHistory[] = stored ? JSON.parse(stored) : []
    // Discard entries from the old analysis format (pre-v2) — only ever
    // relevant to localStorage; every server-side row is v2 by construction.
    return parsed.filter(h => (h.result as { version?: number }).version === 2)
  } catch {
    return []
  }
}

export async function clearHistory(): Promise<void> {
  const userId = await getSignedInUserId()

  if (userId) {
    const supabase = createClient()
    await supabase.from('analyses').delete().eq('user_id', userId)
    return
  }

  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(HISTORY_KEY)
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const userId = await getSignedInUserId()

  if (userId) {
    const supabase = createClient()
    // RLS scopes this to the caller's own rows regardless of what `id` is
    // passed — a stray id belonging to someone else silently deletes nothing.
    await supabase.from('analyses').delete().eq('id', id)
    return
  }

  if (typeof localStorage === 'undefined') return
  const history = await getLocalHistory()
  const filtered = history.filter(entry => entry.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
}

/**
 * Takes the already-fetched history rather than calling getHistory() itself —
 * every caller already has the array in scope after awaiting getHistory(),
 * so this avoids a second round-trip and stays a pure function.
 */
export function getHistoryStats(history: AnalysisHistory[]) {
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
