'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

export function AnalyzingStage({ target }: { target: string }) {
  const { t } = useTranslation()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(v => v + 1), 70)
    return () => clearInterval(id)
  }, [])

  const total = 96
  const tCapped = Math.min(tick, total)

  const PASSES = [
    { code: '01', nameKey: 'analyzing.pass01', detailKey: 'analyzing.pass01Detail' },
    { code: '02', nameKey: 'analyzing.pass02', detailKey: 'analyzing.pass02Detail' },
    { code: '03', nameKey: 'analyzing.pass03', detailKey: 'analyzing.pass03Detail' },
    { code: '04', nameKey: 'analyzing.pass04', detailKey: 'analyzing.pass04Detail' },
  ]

  const passProgress = PASSES.map((_, i) => {
    const start = i * 24
    const local = tCapped - start
    if (local <= 0) return 0
    if (local >= 24) return 1
    return local / 24
  })

  const elapsedSec = (tick * 0.07).toFixed(2)
  const doneCount = passProgress.filter(p => p >= 1).length

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
      {/* Left: pass list */}
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
          {PASSES.map((p, i) => {
            const prog = passProgress[i]
            const done = prog >= 1
            const active = prog > 0 && prog < 1
            return (
              <div key={p.code} style={{
                borderBottom: '1px solid var(--paper-rule)',
                paddingBottom: 14,
                opacity: prog === 0 ? 0.35 : 1,
                transition: 'opacity 280ms ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>{p.code}</span>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    letterSpacing: '0.14em',
                    fontWeight: 600,
                    color: done ? 'var(--moss)' : 'var(--ink)',
                  }}>
                    {t(p.nameKey)}
                  </span>
                  <span style={{ flex: 1, borderBottom: '1px dotted var(--paper-rule)', height: 1, alignSelf: 'center' }} />
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
                    {done ? t('analyzing.done') : active ? `${Math.floor(prog * 100)}%` : t('analyzing.queued')}
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--mono)' }}>
                  {t(p.detailKey)}
                </div>
                <div style={{ marginTop: 10, height: 3, background: 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: `${prog * 100}%`,
                    background: done ? 'var(--moss)' : 'var(--ink)',
                    transition: 'width 80ms linear',
                  }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 22 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
            {t('analyzing.elapsed')} {elapsedSec}s &nbsp;·&nbsp; {t('analyzing.passes')} {doneCount}/4
            {doneCount === 4 && (
              <span style={{ marginLeft: 16, color: 'var(--moss)' }}>{t('analyzing.waitingResults')}</span>
            )}
          </span>
        </div>
      </div>

      {/* Right: scanning placeholder */}
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
            position: 'absolute',
            left: 0, right: 0,
            height: 60,
            background: 'linear-gradient(180deg, transparent 0%, oklch(0.56 0.19 30 / 0.10) 50%, transparent 100%)',
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
