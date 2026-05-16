import { useEffect, useState } from 'react'

const PASSES = [
  { code: '01', name: 'Fact risk' },
  { code: '02', name: 'Bias & framing' },
  { code: '03', name: 'Sensationalism' },
  { code: '04', name: 'Red flags' },
]

export function MeasuringCard({ progress, onCancel }: { progress: number; onCancel: () => void }) {
  // Simulate per-pass advance from the single SSE progress signal we get.
  const [tickPass, setTickPass] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const dur = 2400
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(1, elapsed / dur)
      setTickPass(Math.min(3, Math.floor(p * 4)))
    }, 200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="measure">
      <div className="card">
        <div className="eyebrow-row">
          <div className="q-eyebrow" style={{ color: 'var(--ember)' }}>Measuring</div>
          <span className="q-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>
            {Math.max(progress, Math.min(99, Math.round((tickPass / 4) * 100)))}%
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div className="measure-bars" aria-hidden><span /><span /><span /><span /></div>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink)', lineHeight: 1.35 }}>
            Reading sentence by sentence…
          </span>
        </div>
      </div>

      <div className="pass-list">
        {PASSES.map((p, i) => {
          const done = i < tickPass
          const active = i === tickPass
          const state = done ? 'Done' : active ? 'Working' : 'Queued'
          return (
            <div key={p.code} className={`pass-row${done ? ' done' : active ? ' active' : ''}`}>
              <span className="pass-num">{p.code}</span>
              <span className="pass-name">{p.name}</span>
              <span className="pass-state">{state}</span>
            </div>
          )
        })}
      </div>

      <button className="btn-ghost" onClick={onCancel}>Cancel</button>
    </div>
  )
}
