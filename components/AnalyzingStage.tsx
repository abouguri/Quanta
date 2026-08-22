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
      backgroundColor: 'var(--deep)',
      backgroundImage: 'radial-gradient(circle at center, transparent 21px, rgba(240,215,255,.34) 22px, rgba(240,215,255,.34) 27px, transparent 28px)',
      backgroundSize: '78px 78px',
      color: 'var(--paper)', minHeight: '70vh', padding: '80px 0', margin: '24px 14px 0', borderRadius: 36,
    }}>
      <div className="q-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 64, alignItems: 'start' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
            {t('analyzing.nowReading')}
          </div>
          <div className="mono" style={{ fontSize: 13, color: '#a3a19b', wordBreak: 'break-all' }}>
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
                    <span style={{ color: '#7d7b74' }}>{String(i + 1).padStart(2, '0')}</span>
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
                  <span style={{ color: '#7d7b74' }}>01</span>
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

          <div style={{ marginTop: 28, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7d7b74' }}>
            {doneCount}/{totalCount} {t('analyzing.passes')}
            {doneCount === totalCount && totalCount > 1 && (
              <span style={{ marginLeft: 16, color: 'var(--verified)' }}>{t('analyzing.waitingResults')}</span>
            )}
          </div>
        </div>

        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7d7b74', marginBottom: 14 }}>
            {t('analyzing.frames')}
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, padding: 16, fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 2, color: '#e6e4de', minHeight: 300 }}>
            {steps.map((s, i) => (
              <div key={s.step} className="animate-fadeIn">
                <span style={{ color: '#7d7b74' }}>{String(i + 1).padStart(2, '0')}</span>{' '}
                <span style={{ color: s.done ? 'var(--verified)' : 'var(--accent)' }}>{s.step}</span> {s.label}
              </div>
            ))}
            {steps.length === 0 && <span style={{ color: '#7d7b74' }}>{t('analyzing.queued')}…</span>}
          </div>
          <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7d7b74' }}>
            {t('analyzing.doNotRefresh')}
          </div>
        </div>
      </div>
    </section>
  )
}
