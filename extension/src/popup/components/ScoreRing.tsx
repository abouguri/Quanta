import { useEffect, useState } from 'react'

export function ScoreRing({ score, color }: { score: number; color: string }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    let raf = 0
    let start: number | null = null
    const dur = 600
    const tick = (t: number) => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(score * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])

  const r = 36
  const c = 2 * Math.PI * r
  const offset = c - (displayed / 100) * c

  return (
    <div className="score-ring">
      <svg viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} stroke="var(--mist)" strokeWidth="6" fill="none" />
        <circle
          cx="44" cy="44" r={r}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 80ms linear' }}
        />
      </svg>
      <div className="num" style={{ color }}>
        {displayed}<small>/100</small>
      </div>
    </div>
  )
}
