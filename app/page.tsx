'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArticleInput } from '@/components/ArticleInput'
import { AnalyzingStage } from '@/components/AnalyzingStage'
import { CredibilityReport } from '@/components/CredibilityReport'
import { AnalysisHistory } from '@/components/AnalysisHistory'
import { AnalysisResult } from '@/types/analysis'
import { AnalysisHistory as AnalysisHistoryEntry, saveAnalysis } from '@/lib/history'
import { useTranslation } from '@/lib/i18n'
import {
  QuantaNav, TrustStrip, HowItWorks, ComparePreview,
  Methodology, QuoteStrip, CTAFooter,
} from '@/components/QuantaSections'

type Stage = 'input' | 'analyzing' | 'report'

function HomeInner() {
  const [stage, setStage] = useState<Stage>('input')
  const [target, setTarget] = useState('')
  const [analyzeSteps, setAnalyzeSteps] = useState<Array<{ step: string; label: string; done: boolean }>>([])
  const [activeStepLabel, setActiveStepLabel] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const { language, t } = useTranslation()
  const searchParams = useSearchParams()

  const handleAnalyze = useCallback(async (url: string | null, text: string) => {
    const tgt = url || (text ? `pasted text · ${text.length} chars` : '')
    setTarget(tgt)
    setCurrentUrl(url)
    setResult(null)
    setError(null)
    setAnalyzeSteps([])
    setActiveStepLabel('')
    setStage('analyzing')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      const body = url ? { articleUrl: url, language, tier: 'paid' } : { articleText: text, language, tier: 'paid' }
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
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6)) as Partial<AnalysisResult> & { step?: string; label?: string; progress?: number; error?: string }
            if (data.error) throw new Error(data.error)
            if (data.step && data.label) {
              setAnalyzeSteps(prev => {
                const existing = prev.find(s => s.step === data.step)
                if (existing) return prev
                const updated = prev.map(s => ({ ...s, done: true }))
                return [...updated, { step: data.step!, label: data.label!, done: false }]
              })
              setActiveStepLabel(data.label)
            } else if ((data as AnalysisResult).version === 2) {
              finalResult = data as AnalysisResult
              setAnalyzeSteps(prev => prev.map(s => ({ ...s, done: true })))
              saveAnalysis(finalResult, url || undefined)
              setHistoryRefreshKey(k => k + 1)
            }
          } catch (err) {
            if (err instanceof Error && err.message !== 'Unexpected end of JSON input') throw err
          }
        }
      }
      if (finalResult) {
        setResult(finalResult)
        setStage('report')
      } else throw new Error('No analysis result received')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setStage('input')
    }
  }, [language])

  const handleReset = useCallback(() => {
    setStage('input')
    setResult(null)
    setTarget('')
    setCurrentUrl(null)
    setError(null)
    setAnalyzeSteps([])
    setActiveStepLabel('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSelectHistory = useCallback((entry: AnalysisHistoryEntry) => {
    setCurrentUrl(entry.url || null)
    setTarget(entry.url || entry.title || 'Archived analysis')
    setResult(entry.result)
    setStage('report')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Auto-run when navigated from /landing with ?url=...&auto=1
  useEffect(() => {
    const url = searchParams.get('url')
    const auto = searchParams.get('auto')
    if (url && auto === '1' && stage === 'input') {
      void handleAnalyze(url, '')
    }
    // intentionally only run on first paint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showMarketing = stage === 'input'

  return (
    <div id="app" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <QuantaNav onHome={handleReset} />

      <section style={{ padding: '72px 0 96px' }}>
        <div className="q-container">
          {error && (
            <div style={{
              border: '0.5px solid var(--disputed)',
              borderLeft: '3px solid var(--disputed)',
              padding: '14px 18px',
              marginBottom: 36,
              fontSize: 14,
              borderRadius: 6,
              color: 'var(--disputed)',
              background: 'var(--paper)',
            }}>
              <div className="q-eyebrow" style={{ color: 'var(--disputed)', marginBottom: 4 }}>
                {t('error.title')}
              </div>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 64 }}>
            <main style={{ minWidth: 0 }}>
              {stage === 'input' && <ArticleInput onSubmit={handleAnalyze} />}
              {stage === 'analyzing' && <AnalyzingStage target={target} steps={analyzeSteps} activeLabel={activeStepLabel} />}
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
      </section>

      {showMarketing && (
        <>
          <TrustStrip />
          <HowItWorks />
          <ComparePreview />
          <Methodology />
          <QuoteStrip />
          <CTAFooter />
        </>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  )
}
