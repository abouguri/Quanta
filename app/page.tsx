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
  const { language, setLanguage, t } = useTranslation()

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
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 32,
        padding: '24px 0',
        marginBottom: 56,
        borderBottom: '0.5px solid var(--fog)',
      }}>
        <button
          onClick={handleReset}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          aria-label="Quanta home"
        >
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#0F2942"/>
            <circle cx="32" cy="30" r="13" stroke="#F5F2EA" strokeWidth="2.5" fill="none"/>
            <circle cx="44" cy="42" r="3.2" fill="#E8A33D"/>
          </svg>
          <span style={{
            fontFamily: 'var(--sans)',
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
          }}>
            Quanta<span style={{ color: 'var(--ember)' }}>.</span>
          </span>
        </button>

        <nav style={{
          display: 'flex',
          gap: 32,
          fontFamily: 'var(--sans)',
          fontSize: 14,
          color: 'var(--ink-2)',
        }}>
          {(['Analyze', 'Methodology', 'Pricing', 'For teams', 'API'] as const).map(item => (
            <button
              key={item}
              onClick={item === 'Analyze' ? handleReset : undefined}
              style={{
                color: item === 'Analyze' ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: item === 'Analyze' ? 500 : 400,
                cursor: item === 'Analyze' ? 'pointer' : 'default',
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <NavPill label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
          <NavPill label="AR" active={language === 'ar'} onClick={() => setLanguage('ar')} />
          <button style={{
            border: 0,
            padding: '9px 18px',
            fontFamily: 'var(--sans)',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 8,
            cursor: 'pointer',
            color: 'var(--bone)',
            background: 'var(--ink)',
            marginLeft: 4,
          }}>
            Install extension
          </button>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 64 }}>
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
        marginTop: 96,
        paddingTop: 24,
        borderTop: '0.5px solid var(--fog)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'var(--sans)',
        fontSize: 13,
        color: 'var(--ink-4)',
      }}>
        <span style={{ fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          Quanta — Truth, measured.
        </span>
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
        padding: '6px 11px',
        border: active ? '1px solid var(--ink)' : '0.5px solid var(--fog)',
        borderRadius: 6,
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--bone)' : 'var(--ink-3)',
        fontFamily: 'var(--sans)',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.02em',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
