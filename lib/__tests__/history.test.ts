import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AnalysisResult } from '@/types/analysis'

const isSupabaseConfigured = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/config', () => ({ isSupabaseConfigured }))

const getUser = vi.hoisted(() => vi.fn())
const from = vi.hoisted(() => vi.fn())
const createClient = vi.hoisted(() => vi.fn(() => ({ auth: { getUser }, from })))
vi.mock('@/lib/supabase/client', () => ({ createClient }))

import { clearHistory, deleteHistoryEntry, getHistory, getHistoryStats, saveAnalysis } from '@/lib/history'

/** vitest.config.ts runs in a plain Node environment, which has no localStorage global. */
function stubLocalStorage() {
  const store = new Map<string, string>()
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => store.clear(),
    key: () => null,
    get length() { return store.size },
  }
  vi.stubGlobal('localStorage', storage)
  return storage
}

const RESULT: AnalysisResult = {
  version: 2,
  tier: 'free',
  overallScore: 78,
  analyzedAt: 1_700_000_000_000,
  structural: { score: 78, flags: [], metrics: { hasAuthor: true, hasDate: true, capsRatio: 0, exclamationDensity: 0, suspiciousDomain: false, articleLength: 500 } },
  metadata: { title: 'A well-reported piece', source: 'example.com' },
}

/** A chainable stub matching enough of the supabase-js query builder surface for these tests. */
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (v: typeof result) => void) => Promise.resolve(result).then(resolve),
  }
  return builder
}

describe('lib/history — anonymous (no Supabase session)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    stubLocalStorage()
    isSupabaseConfigured.mockReturnValue(false)
  })

  it('saveAnalysis writes to localStorage and getHistory reads it back', async () => {
    await saveAnalysis(RESULT, 'https://example.com/article')
    const history = await getHistory()

    expect(history).toHaveLength(1)
    expect(history[0]).toMatchObject({ url: 'https://example.com/article', score: 78, title: 'A well-reported piece' })
    expect(from).not.toHaveBeenCalled()
  })

  it('discards pre-v2 entries already sitting in localStorage', async () => {
    localStorage.setItem('quanta_analysis_history', JSON.stringify([
      { id: '1', score: 50, date: Date.now(), result: { version: 1 } },
    ]))
    await expect(getHistory()).resolves.toEqual([])
  })

  it('clearHistory empties localStorage', async () => {
    await saveAnalysis(RESULT)
    await clearHistory()
    await expect(getHistory()).resolves.toEqual([])
  })

  it('deleteHistoryEntry removes only the matching id', async () => {
    const a = await saveAnalysis(RESULT, 'https://a.example.com')
    const b = await saveAnalysis(RESULT, 'https://b.example.com')

    await deleteHistoryEntry(a!.id)
    const remaining = await getHistory()

    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(b!.id)
  })

  it('caps localStorage history at 50 entries', async () => {
    for (let i = 0; i < 55; i++) await saveAnalysis(RESULT, `https://example.com/${i}`)
    await expect(getHistory()).resolves.toHaveLength(50)
  })
})

describe('lib/history — signed in (Supabase configured, real session)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    stubLocalStorage()
    isSupabaseConfigured.mockReturnValue(true)
    getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
  })

  it('getHistory queries analyses scoped to the signed-in user, not localStorage', async () => {
    const row = { id: 'row-1', url: 'https://example.com', title: 'Piece', score: 91, result: RESULT, created_at: '2026-01-01T00:00:00.000Z' }
    const builder = makeQueryBuilder({ data: [row], error: null })
    from.mockReturnValue(builder)

    const history = await getHistory()

    expect(from).toHaveBeenCalledWith('analyses')
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-123')
    expect(history).toEqual([{ id: 'row-1', url: 'https://example.com', title: 'Piece', score: 91, date: Date.parse('2026-01-01T00:00:00.000Z'), result: RESULT }])
    expect(localStorage.getItem('quanta_analysis_history')).toBeNull()
  })

  it('saveAnalysis inserts a row and never touches localStorage', async () => {
    const row = { id: 'row-2', url: 'https://example.com', title: RESULT.metadata.title, score: RESULT.overallScore, result: RESULT, created_at: '2026-01-02T00:00:00.000Z' }
    const builder = makeQueryBuilder({ data: row, error: null })
    from.mockReturnValue(builder)

    const entry = await saveAnalysis(RESULT, 'https://example.com')

    expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-123', url: 'https://example.com' }))
    expect(entry?.id).toBe('row-2')
    expect(localStorage.getItem('quanta_analysis_history')).toBeNull()
  })

  it('a failed insert returns null rather than throwing', async () => {
    const builder = makeQueryBuilder({ data: null, error: new Error('insert failed') })
    from.mockReturnValue(builder)
    await expect(saveAnalysis(RESULT)).resolves.toBeNull()
  })

  it('clearHistory deletes by user_id', async () => {
    const builder = makeQueryBuilder({ data: null, error: null })
    from.mockReturnValue(builder)

    await clearHistory()

    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-123')
  })

  it('deleteHistoryEntry deletes by id, relying on RLS to scope ownership', async () => {
    const builder = makeQueryBuilder({ data: null, error: null })
    from.mockReturnValue(builder)

    await deleteHistoryEntry('row-1')

    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('id', 'row-1')
  })
})

describe('lib/history — Supabase configured but no active session', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    stubLocalStorage()
    isSupabaseConfigured.mockReturnValue(true)
    getUser.mockResolvedValue({ data: { user: null } })
  })

  it('falls back to localStorage rather than querying Supabase', async () => {
    await saveAnalysis(RESULT)
    await expect(getHistory()).resolves.toHaveLength(1)
    expect(from).not.toHaveBeenCalled()
  })
})

describe('getHistoryStats', () => {
  it('summarizes a batch of history entries without re-fetching', () => {
    const entries = [78, 91, 35, 20, 85].map((score, i) => ({
      id: String(i), score, date: Date.now(), result: RESULT,
    }))
    expect(getHistoryStats(entries)).toEqual({ total: 5, average: 62, highRisk: 2, reliable: 2 })
  })

  it('handles an empty history without dividing by zero', () => {
    expect(getHistoryStats([])).toEqual({ total: 0, average: 0, highRisk: 0, reliable: 0 })
  })
})
