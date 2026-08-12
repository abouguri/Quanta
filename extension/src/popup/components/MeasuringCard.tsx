import { useEffect, useRef, useState } from 'react'

const PASSES = [
  { code: '01', name: 'Structural signals' },
  { code: '02', name: 'Claim extraction' },
  { code: '03', name: 'Claim verification' },
]

interface Props {
  // 0 = not started; 1-3 = working on that step; 4 = result frame received
  currentPass: number
  progress: number
  onCancel: () => void
}

export function MeasuringCard({ currentPass, progress, onCancel }: Props) {
  // Slow creep on the active pass so the user feels motion between SSE frames.
  const [creep, setCreep] = useState(0)
  const lastPass = useRef(currentPass)
  useEffect(() => {
    if (lastPass.current !== currentPass) {
      setCreep(0)
      lastPass.current = currentPass
    }
    const id = setInterval(() => setCreep(c => Math.min(0.85, c + 0.04)), 120)
    return () => clearInterval(id)
  }, [currentPass])

  const headlineProgress = Math.max(progress, Math.min(99, currentPass * 22 + creep * 22))

  return (
    <div className="measure">
      <div className="card">
        <div className="eyebrow-row">
          <div className="q-eyebrow" style={{ color: 'var(--ember)' }}>Measuring</div>
          <span className="q-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>
            {Math.round(headlineProgress)}%
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
          const pass = i + 1
          const done = currentPass > pass
          const active = currentPass === pass
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
