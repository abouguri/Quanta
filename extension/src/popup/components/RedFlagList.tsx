import type { RedFlag } from '@/lib/types'

export function RedFlagList({ flags }: { flags: RedFlag[] }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="card" style={{ padding: '10px 14px' }}>
        <div className="q-eyebrow">Red flags</div>
        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-4)' }}>None detected.</div>
      </div>
    )
  }
  return (
    <div>
      <div className="section-title">Red flags · {flags.length}</div>
      <div className="flags">
        {flags.map((f, i) => (
          <div key={i} className={`flag${f.severity === 'low' ? ' flag-low' : ''}`}>
            <span className="flag-dot" />
            <div>
              <span style={{ fontWeight: 600, fontSize: 12 }}>{f.type}</span>{' '}
              <span style={{ color: 'var(--ink-4)' }}>· {f.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
