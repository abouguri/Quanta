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
    const id = setInterval(() => setCreep(c => Math.min(0.85, c + 0.012)), 80)
    return () => clearInterval(id)
  }, [activeLabel])

  const doneCount = steps.filter(s => s.done).length
  const totalCount = steps.length || 1

  return (
    <section
      className="animate-fadeIn"
      style={{
        borderTop: '1px solid var(--ink)',
        paddingTop: 24,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 3fr)',
        gap: 36,
      }}
    >
      <div>
        <p className="smcap" style={{ color: 'var(--vermillion)', margin: 0 }}>{t('analyzing.nowReading')}</p>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-3)', marginTop: 6, wordBreak: 'break-all' }}>
          {target}
        </div>

        <h2 style={{
          fontFamily: 'var(--serif)',
          fontWeight: 400,
          fontSize: 'clamp(40px, 5vw, 64px)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '16px 0 28px',
          color: 'var(--ink)',
        }}>
          {t('analyzing.working')}<span className="caret" />
        </h2>

        <div style={{ display: 'grid', gap: 14 }}>
          {steps.map((s, i) => {
            const prog = s.done ? 1 : (steps[i]?.step === steps.find(x => !x.done)?.step ? Math.max(0.05, creep) : 0)
            return (
              <div key={s.step} style={{
                borderBottom: '1px solid var(--paper-rule)',
                paddingBottom: 14,
                opacity: prog === 0 && !s.done ? 0.35 : 1,
                transition: 'opacity 280ms ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    letterSpacing: '0.14em',
                    fontWeight: 600,
                    color: s.done ? 'var(--moss)' : 'var(--ink)',
                  }}>
                    {s.label}
                  </span>
                  <span style={{ flex: 1, borderBottom: '1px dotted var(--paper-rule)', height: 1, alignSelf: 'center' }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
                    {s.done ? t('analyzing.done') : prog > 0 ? t('analyzing.working') : t('analyzing.queued')}
                  </span>
                </div>
                <div style={{ marginTop: 10, height: 3, background: 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${prog * 100}%`,
                    background: s.done ? 'var(--moss)' : 'var(--ink)',
                    transition: 'width 220ms ease-out',
                  }} />
                </div>
              </div>
            )
          })}

          {steps.length === 0 && (
            <div style={{ borderBottom: '1px solid var(--paper-rule)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>01</span>
                <span className="mono" style={{ fontSize: 13, letterSpacing: '0.14em', fontWeight: 600, color: 'var(--ink)' }}>
                  Structural analysis
                </span>
                <span style={{ flex: 1, borderBottom: '1px dotted var(--paper-rule)', height: 1, alignSelf: 'center' }} />
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
                  {t('analyzing.working')}
                </span>
              </div>
              <div style={{ marginTop: 10, height: 3, background: 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${Math.max(0.05, creep) * 100}%`,
                  background: 'var(--ink)',
                  transition: 'width 220ms ease-out',
                }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 22 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
            {doneCount}/{totalCount} steps complete
            {doneCount === totalCount && totalCount > 1 && (
              <span style={{ marginLeft: 16, color: 'var(--moss)' }}>{t('analyzing.waitingResults')}</span>
            )}
          </span>
        </div>
      </div>

      <aside>
        <p className="smcap" style={{ color: 'var(--ink-3)', margin: 0 }}>{t('analyzing.articleSurface')}</p>
        <div style={{
          marginTop: 12,
          border: '1px solid var(--paper-rule)',
          position: 'relative',
          overflow: 'hidden',
          padding: 18,
          background: 'var(--paper)',
          height: 360,
        }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 60,
            background: 'linear-gradient(180deg, transparent 0%, rgba(26,77,122,0.12) 50%, transparent 100%)',
            top: 0,
            animation: 'scan 2.2s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'grid', gap: 10 }}>
            {[100, 92, 96, 88, 70, 100, 84, 91, 60, 95, 89, 100, 78, 92].map((w, i) => (
              <div key={i} style={{
                height: i === 0 ? 18 : 10,
                width: `${w}%`,
                background: i === 0 ? 'var(--ink)' : 'var(--paper-rule)',
                opacity: i === 0 ? 1 : 0.6,
              }} />
            ))}
          </div>
        </div>
        <div className="mono" style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
          {t('analyzing.doNotRefresh')}
        </div>
      </aside>
    </section>
  )
}
