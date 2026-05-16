import { useCallback, useEffect, useState } from 'react'
import { getRateLimitState } from '@/lib/storage'

export interface RateLimitState {
  used: number
  remaining: number
  resetsInMs: number | null
  loading: boolean
}

export function useRateLimit(): { state: RateLimitState; refresh: () => Promise<void> } {
  const [state, setState] = useState<RateLimitState>({ used: 0, remaining: 3, resetsInMs: null, loading: true })

  const refresh = useCallback(async () => {
    const next = await getRateLimitState()
    setState({ ...next, loading: false })
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  return { state, refresh }
}

export function formatResetTime(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000))
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}
