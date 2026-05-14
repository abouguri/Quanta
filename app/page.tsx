'use client'

import { useState, useCallback } from 'react'
import { ArticleInput } from '@/components/ArticleInput'
import { AnalyzingStage } from '@/components/AnalyzingStage'
import { CredibilityReport } from '@/components/CredibilityReport'
import { AnalysisHistory } from '@/components/AnalysisHistory'
import { AnalysisResult } from '@/types/analysis'
import { AnalysisHistory as AnalysisHistoryEntry, saveAnalysis } from '@/lib/history'
import { useTranslation } from '@/lib/i18n'

type Stage = 'input' | 'analyzing' | 'report'


export default function Home() {
  const [stage, setStage] = useState<Stage>('input')
  const [target, setTarget] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [now] = useState(new Date())
  const { language, setLanguage, t } = useTranslation()

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  }).toUpperCase()

  const handleAnalyze = useCallback(async (url: string | null, text: string) => {
    const tgt = url || (text ? `pasted text · ${text.length} chars` : '')
    setTarget(tgt)
    setCurrentUrl(url)
    setResult(null)
    setError(null)
    setStage('analyzing')

    try {
      const body = url
        ? { articleUrl: url, language }
        : { articleText: text, language }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json() as { error?: string }
        throw new Error(errorData.error || 'Analysis failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let buffer = ''
      let finalResult: AnalysisResult | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += new TextDecoder().decode(value)
        const lines = buffer.split('\n')
        buffer = lines[lines.length - 1]
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i]
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as AnalysisResult
              if (data.overallScore !== undefined) {
                finalResult = data
                saveAnalysis(data, url || undefined)
                setHistoryRefreshKey(k => k + 1)
              }
            } catch { /* ignore parse errors */ }
          }
        }
      }

      if (finalResult) {
        setResult(finalResult)
        setStage('report')
      } else {
        throw new Error('No analysis result received')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      setError(message)
      setStage('input')
    }
  }, [language])

  const handleReset = useCallback(() => {
    setStage('input')
    setResult(null)
    setTarget('')
    setCurrentUrl(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSelectHistory = useCallback((entry: AnalysisHistoryEntry) => {
    setCurrentUrl(entry.url || null)
    setTarget(entry.url || entry.title || 'Archived analysis')
    setResult(entry.result)
    setStage('report')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div
      id="app"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{ maxWidth: 1320, margin: '0 auto', padding: '0 36px 72px' }}
    >
      {/* ─── Masthead ─── */}
      <header style={{ marginBottom: 40 }}>

        {/* Top utility strip */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          padding: '14px 0',
          borderBottom: '0.5px solid var(--fog)',
        }}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{dateStr}</span>
          <span style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 5, height: 5,
                background: 'var(--verified)',
                borderRadius: 5,
                animation: 'pulse-dot 2.4s ease-in-out infinite',
              }} />
              {t('header.liveStatus')}
            </span>
            <span>Vol. I · No. 0427</span>
          </span>
        </div>

        {/* Logotype row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 32,
          padding: '22px 0 20px',
          borderBottom: '1px solid var(--ink)',
        }}>
          {/* Left: logo + wordmark */}
          <button
            onClick={handleReset}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            aria-label="Quanta home"
          >
            {/* Monogram: Q-circle in rounded square + ember dot */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect width="36" height="36" rx="7" fill="#F5F2EA" stroke="#0F2942" strokeWidth="1"/>
              <circle cx="16" cy="16" r="9.5" stroke="#0F2942" strokeWidth="2.2"/>
              <circle cx="25" cy="25" r="3.2" fill="#E8A33D"/>
            </svg>
            <div>
              <div style={{
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                fontSize: 28,
                letterSpacing: '-0.035em',
                lineHeight: 1,
                color: 'var(--ink)',
              }}>
                quanta<span style={{ color: 'var(--ember)' }}>.</span>
              </div>
              <div style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 13,
                color: 'var(--ink-3)',
                lineHeight: 1,
                marginTop: 4,
                letterSpacing: 0,
              }}>
                Truth, measured.
              </div>
            </div>
          </button>

          {/* Center: nav */}
          <nav style={{
            display: 'flex',
            gap: 28,
            justifyContent: 'center',
            fontFamily: 'var(--sans)',
            fontSize: 12,
            letterSpacing: '0.02em',
          }}>
            {(['Analyze', 'Compare', 'Library', 'Methodology'] as const).map(item => (
              <button
                key={item}
                onClick={item === 'Analyze' ? handleReset : undefined}
                style={{
                  color: item === 'Analyze' && stage !== 'input' ? 'var(--ink-3)' : 'var(--ink-2)',
                  fontWeight: item === 'Analyze' ? 500 : 400,
                  cursor: item === 'Analyze' ? 'pointer' : 'default',
                  padding: '4px 0',
                }}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right: language + CTA */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <NavPill label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
            <NavPill label="AR" active={language === 'ar'} onClick={() => setLanguage('ar')} />
            <div style={{ width: 1, height: 16, background: 'var(--fog)', margin: '0 4px' }} />
            <button
              onClick={() => alert(t('header.methodAlert'))}
              style={{
                border: '1px solid var(--ink)',
                padding: '7px 14px',
                fontFamily: 'var(--mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                cursor: 'pointer',
                color: 'var(--ink)',
                background: 'transparent',
              }}
            >
              {t('header.method')}
            </button>
            <button style={{
              border: 'none',
              padding: '7px 16px',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              cursor: 'pointer',
              color: 'var(--bone)',
              background: 'var(--ink)',
            }}>
              Pro
            </button>
          </div>
        </div>

        {/* Subtitle rule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 0 0',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          color: 'var(--ink-3)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          <span>The credibility instrument</span>
          <span style={{ flex: 1, height: '0.5px', background: 'var(--fog)' }} />
          <span>Free · 3 analyses / day · no account needed</span>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div style={{
          border: '1px solid var(--disputed)',
          borderLeft: '3px solid var(--disputed)',
          padding: '12px 16px',
          marginBottom: 28,
          fontFamily: 'var(--mono)',
          fontSize: 12,
          color: 'var(--disputed)',
          background: 'var(--paper)',
        }}>
          <span className="smcap" style={{ color: 'var(--disputed)', display: 'block', marginBottom: 4 }}>{t('error.title')}</span>
          {error}
        </div>
      )}

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 48 }}>
        <main style={{ minWidth: 0 }}>
          {stage === 'input' && (
            <ArticleInput onSubmit={handleAnalyze} />
          )}
          {stage === 'analyzing' && (
            <AnalyzingStage target={target} />
          )}
          {stage === 'report' && result && (
            <CredibilityReport result={result} currentUrl={currentUrl} onReset={handleReset} />
          )}
        </main>

        <AnalysisHistory
          onSelect={handleSelectHistory}
          currentUrl={currentUrl}
          refreshKey={historyRefreshKey}
        />
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: 64,
        paddingTop: 16,
        borderTop: '0.5px solid var(--fog)',
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--mono)',
        fontSize: 10,
        color: 'var(--ink-4)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>
        <span>Quanta · Truth, measured.</span>
        <span>Open methodology · Independent · Ad-free</span>
      </footer>
    </div>
  )
}

function NavPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 10px',
        border: active ? '1px solid var(--ink)' : '1px solid var(--fog)',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--bone)' : 'var(--ink-3)',
        fontFamily: 'var(--mono)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
