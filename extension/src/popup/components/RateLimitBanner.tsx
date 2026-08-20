import { formatResetTime } from '../hooks/useRateLimit'

export function RateLimitPill({ used, remaining }: { used: number; remaining: number }) {
  return (
    <span className="q-mono" style={{ fontSize: 9, color: '#7d7b74', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
      {remaining} of {used + remaining} today
    </span>
  )
}

export function RateLimitBanner({ resetsInMs }: { resetsInMs: number | null }) {
  return (
    <div className="banner">
      <div>
        <div className="q-eyebrow" style={{ color: 'var(--ember)' }}>Daily limit reached</div>
        <div style={{ marginTop: 4 }}>
          You’ve used your 3 free analyses for today.
          {resetsInMs != null && <> Resets in <strong>{formatResetTime(resetsInMs)}</strong>.</>}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-4)' }}>
          Pro removes the daily cap — coming soon.
        </div>
      </div>
    </div>
  )
}
