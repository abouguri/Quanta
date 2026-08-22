'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/lib/i18n'

interface AnalyzeStep {
  step: string
  label: string
  done: boolean
}

interface Props {
  target: string
  steps: AnalyzeStep[]
  activeLabel: string
}

// left position, stroke width, animation duration and negative delay (so
// strokes are already mid-fall on mount instead of bunching at the top)
const RAIN_STROKES: Array<[string, number, number, number]> = [
  ['4%', 72, 7, -1.2], ['12%', 38, 9, -4.5], ['21%', 96, 6.5, -3.1],
  ['31%', 54, 8.5, -6.8], ['41%', 110, 7.5, -0.4], ['52%', 45, 10, -8.2],
  ['9%', 30, 11, -5.6], ['63%', 66, 6, -2.3], ['74%', 80, 9.5, -7.1],
  ['84%', 58, 8, -1.9], ['93%', 40, 7, -4.9], ['57%', 92, 10.5, -9.4],
]

/** Thin evidence strokes drifting down the analyzing panel — citations arriving, not a generic spinner. */
function CitationRain() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {RAIN_STROKES.map(([left, width, duration, delay], i) => (
        <span
          key={i}
          className="q-rain-stroke"
          style={{
            position: 'absolute', left, top: '50%', width, height: 3, borderRadius: 999,
            background: i % 2 === 0 ? 'var(--accent)' : '#FFFFEB',
            opacity: i % 4 === 3 ? 0.16 : i % 2 === 0 ? 0.5 : 0.24,
            animation: `citationRain ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export function AnalyzingStage({ target, steps, activeLabel }: Props) {
  const { t } = useTranslation()
  const [creep, setCreep] = useState(0)
  const activeStepRef = useRef(activeLabel)

  useEffect(() => {
    if (activeStepRef.current !== activeLabel) {
      setCreep(0)
      activeStepRef.current = activeLabel
    }
    const id = setInterval(() => setCreep(c => Math.min(0.9, c + 0.02)), 90)
    return () => clearInterval(id)
  }, [activeLabel])

  const doneCount = steps.filter(s => s.done).length
  const totalCount = steps.length || 1

  return (
    <section className="animate-fadeIn" style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--deep)',
      color: 'var(--on-deep)', minHeight: '70vh', padding: '80px 0', margin: '24px 14px 0', borderRadius: 36,
    }}>
      <CitationRain />
      <div className="q-container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 64, alignItems: 'start' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
            {t('analyzing.nowReading')}
          </div>
          <div className="mono" style={{ fontSize: 13, color: 'var(--on-deep-2)', wordBreak: 'break-all' }}>
            {target}
          </div>

          <h2 style={{
            fontFamily: 'var(--sans)',
            fontWeight: 700,
            fontSize: 'clamp(32px, 4vw, 56px)',
            lineHeight: 1.06,
            letterSpacing: '-0.025em',
            margin: '20px 0 34px',
          }}>
            {t('analyzing.working')}<span className="caret" style={{ background: 'var(--accent)' }} />
          </h2>

          <div style={{ display: 'grid', gap: 0 }}>
            {steps.map((s, i) => {
              const isActive = !s.done && steps.find(x => !x.done)?.step === s.step
              const prog = s.done ? 1 : isActive ? Math.max(0.06, creep) : 0
              return (
                <div key={s.step} style={{ borderTop: '1px dashed rgba(255,255,255,0.22)', padding: '16px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--on-deep-3)' }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ color: s.done ? 'var(--verified)' : 'var(--paper)' }}>{s.label}</span>
                    <span style={{ flex: 1, borderBottom: '1px dotted rgba(255,255,255,0.24)', height: 1, alignSelf: 'center' }} />
                    <span style={{ color: s.done ? 'var(--verified)' : 'var(--accent)' }}>
                      {s.done ? t('analyzing.done') : prog > 0 ? t('analyzing.working') : t('analyzing.queued')}
                    </span>
                  </div>
                  <div style={{ marginTop: 10, height: 2, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${prog * 100}%`,
                      background: s.done ? 'var(--verified)' : 'var(--accent)',
                      transition: 'width 220ms linear',
                    }} />
                  </div>
                </div>
              )
            })}

            {steps.length === 0 && (
              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.22)', padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  <span style={{ color: 'var(--on-deep-3)' }}>01</span>
                  <span>{t('analyzing.pass01')}</span>
                  <span style={{ flex: 1, borderBottom: '1px dotted rgba(255,255,255,0.24)', height: 1, alignSelf: 'center' }} />
                  <span style={{ color: 'var(--accent)' }}>{t('analyzing.working')}</span>
                </div>
                <div style={{ marginTop: 10, height: 2, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(0.06, creep) * 100}%`, background: 'var(--accent)', transition: 'width 220ms linear' }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 28, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-deep-3)' }}>
            {doneCount}/{totalCount} {t('analyzing.passes')}
            {doneCount === totalCount && totalCount > 1 && (
              <span style={{ marginLeft: 16, color: 'var(--verified)' }}>{t('analyzing.waitingResults')}</span>
            )}
          </div>
        </div>

        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--on-deep-3)', marginBottom: 14 }}>
            {t('analyzing.frames')}
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: 16, fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 2, color: '#e6e4de', minHeight: 300 }}>
            {steps.map((s, i) => (
              <div key={s.step} className="animate-fadeIn">
                <span style={{ color: 'var(--on-deep-3)' }}>{String(i + 1).padStart(2, '0')}</span>{' '}
                <span style={{ color: s.done ? 'var(--verified)' : 'var(--accent)' }}>{s.step}</span> {s.label}
              </div>
            ))}
            {steps.length === 0 && <span style={{ color: 'var(--on-deep-3)' }}>{t('analyzing.queued')}…</span>}
          </div>
          <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-deep-3)' }}>
            {t('analyzing.doNotRefresh')}
          </div>
        </div>
      </div>
    </section>
  )
}
