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
  const { language, setLanguage } = useTranslation()

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).toUpperCase()

  const handleAnalyze = useCallback(async (url: string | null, text: string) => {
    const t = url || (text ? `pasted text · ${text.length} chars` : '')
    setTarget(t)
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
      data-density="comfortable"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{ maxWidth: 1320, margin: '0 auto', padding: '28px 36px 64px' }}
    >
      {/* Masthead */}
      <header style={{ borderBottom: '1px solid var(--ink)', paddingBottom: 20, marginBottom: 32 }}>
        {/* top utility strip */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--ink-2)',
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          paddingBottom: 14,
          borderBottom: '1px solid var(--paper-rule)',
          marginBottom: 18,
        }}>
          <span>{dateStr}</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 6, height: 6,
                background: 'var(--moss)',
                borderRadius: 6,
                animation: 'pulse-dot 2s ease-in-out infinite',
              }} />
              Live analysis online
            </span>
            <span>Vol. I — No. 0427</span>
          </span>
        </div>

        {/* logotype row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <button onClick={handleReset} style={{ textAlign: 'left', cursor: 'pointer' }}>
            <h1 style={{
              fontFamily: 'var(--serif)',
              fontWeight: 400,
              fontSize: 'clamp(48px, 7vw, 88px)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--ink)',
            }}>
              Fact<span style={{ fontStyle: 'italic', color: 'var(--vermillion)' }}>News</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink-3)', verticalAlign: 'top', marginLeft: 6, letterSpacing: 0 }}>™</span>
            </h1>
            <p style={{
              margin: '6px 0 0',
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 20,
              color: 'var(--ink-2)',
              lineHeight: 1.2,
            }}>
              an instrument for reading news with both eyes open.
            </p>
          </button>

          <div style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-2)',
          }}>
            <NavPill label="EN" active={language === 'en'} onClick={() => setLanguage('en')} />
            <NavPill label="AR" active={language === 'ar'} onClick={() => setLanguage('ar')} />
            <span style={{ width: 1, height: 16, background: 'var(--paper-rule)', margin: '0 6px' }} />
            <button
              onClick={() => alert('FactNews — Four-pass AI review: Fact Risk → Bias & Framing → Sensationalism → Red Flags. Credibility scored 0–100. Not legal advice.')}
              style={{
                border: '1px solid var(--ink)',
                padding: '8px 14px',
                background: 'transparent',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                cursor: 'pointer',
              }}
            >
              Method →
            </button>
          </div>
        </div>

        {/* double rule */}
        <div style={{ marginTop: 18, height: 1, background: 'var(--ink)' }} />
        <div style={{ marginTop: 3, height: 1, background: 'var(--ink)' }} />
      </header>

      {/* Error banner */}
      {error && (
        <div style={{
          border: '1px solid var(--vermillion)',
          borderLeft: '3px solid var(--vermillion)',
          padding: '14px 18px',
          marginBottom: 28,
          fontFamily: 'var(--mono)',
          fontSize: 13,
          color: 'var(--vermillion)',
          background: 'var(--paper-2)',
        }}>
          <span className="smcap" style={{ color: 'var(--vermillion)', display: 'block', marginBottom: 4 }}>Analysis error</span>
          {error}
        </div>
      )}

      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 40 }}>
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
    </div>
  )
}

function NavPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 12px',
        border: active ? '1px solid var(--ink)' : '1px solid transparent',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--paper)' : 'var(--ink-2)',
        fontFamily: 'var(--mono)',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
