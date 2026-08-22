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
import { AnalysisFailure, resolveErrorMessage } from '@/lib/errorMessages'
import {
  QuantaNav, CostSection, SignalsSection, InspectorSection, MethodSection, AccessSection,
} from '@/components/QuantaSections'

type Stage = 'input' | 'analyzing' | 'report'

/** Carries the API's failure code alongside its message. */
class AnalysisRequestError extends Error {
  constructor(readonly failure: AnalysisFailure) {
    super(failure.message ?? 'Analysis failed')
    this.name = 'AnalysisRequestError'
  }
}

function HomeInner() {
  const [stage, setStage] = useState<Stage>('input')
  const [target, setTarget] = useState('')
  const [analyzeSteps, setAnalyzeSteps] = useState<Array<{ step: string; label: string; done: boolean }>>([])
  const [activeStepLabel, setActiveStepLabel] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [failure, setFailure] = useState<AnalysisFailure | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [historyOpen, setHistoryOpen] = useState(false)
  const { language, t } = useTranslation()
  const searchParams = useSearchParams()

  const handleAnalyze = useCallback(async (url: string | null, text: string) => {
    const tgt = url || (text ? `pasted text · ${text.length} chars` : '')
    setTarget(tgt)
    setCurrentUrl(url)
    setResult(null)
    setFailure(null)
    setAnalyzeSteps([])
    setActiveStepLabel('')
    setStage('analyzing')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      // Tier is resolved server-side — the client doesn't get a say.
      const body = url ? { articleUrl: url, language } : { articleText: text, language }
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as AnalysisFailure
        throw new AnalysisRequestError(body)
      }
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      // One decoder for the whole stream, in streaming mode: a fresh decoder per
      // chunk mangles any multi-byte character that straddles a chunk boundary,
      // which is most of an Arabic article.
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let finalResult: AnalysisResult | null = null
      let streamError: AnalysisRequestError | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // SSE frames are separated by a blank line; anything after the last
        // separator is a partial frame to carry into the next read.
        let sep: number
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, sep)
          buffer = buffer.slice(sep + 2)
          if (!frame.startsWith('data: ')) continue

          let data: Partial<AnalysisResult> & { step?: string; label?: string; progress?: number; error?: string; code?: string }
          try {
            data = JSON.parse(frame.slice(6))
          } catch {
            continue // not a frame we can use; the stream carries on
          }

          if (data.error) {
            streamError = new AnalysisRequestError({ code: data.code, message: data.error })
            break
          }
          if (data.step && data.label) {
            const { step, label } = data
            setAnalyzeSteps(prev =>
              prev.some(s => s.step === step)
                ? prev
                : [...prev.map(s => ({ ...s, done: true })), { step, label, done: false }]
            )
            setActiveStepLabel(label)
          } else if ((data as AnalysisResult).version === 2) {
            finalResult = data as AnalysisResult
            setAnalyzeSteps(prev => prev.map(s => ({ ...s, done: true })))
            await saveAnalysis(finalResult, url || undefined)
            setHistoryRefreshKey(k => k + 1)
          }
        }
        if (streamError) break
      }

      if (streamError) throw streamError
      if (finalResult) {
        setResult(finalResult)
        setStage('report')
      } else throw new Error('No analysis result received')
    } catch (err) {
      setFailure(
        err instanceof AnalysisRequestError
          ? err.failure
          : { message: err instanceof Error ? err.message : undefined },
      )
      setStage('input')
    }
  }, [language])

  const handleReset = useCallback(() => {
    setStage('input')
    setResult(null)
    setTarget('')
    setCurrentUrl(null)
    setFailure(null)
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
    <div id="app" dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ background: 'var(--bone)', minHeight: '100vh' }}>
      <a href="#main" className="q-skip-link">{t('a11y.skipToContent')}</a>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 14px 0' }}>
        <QuantaNav onHome={handleReset} onOpenHistory={() => setHistoryOpen(true)} />
      </div>

      <AnalysisHistory
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleSelectHistory}
        currentUrl={currentUrl}
        refreshKey={historyRefreshKey}
      />

      <main id="main">

      {failure && (
        <div className="q-container" style={{ paddingTop: 24 }}>
          <div style={{
            border: '0.5px solid var(--unsupported)',
            borderLeft: '3px solid var(--unsupported)',
            padding: '14px 18px',
            fontSize: 14,
            borderRadius: 6,
            color: 'var(--unsupported)',
            background: 'var(--white)',
          }}>
            <div className="q-eyebrow" style={{ color: 'var(--unsupported)', marginBottom: 4 }}>
              {t('error.title')}
            </div>
            {resolveErrorMessage(failure, t)}
          </div>
        </div>
      )}

      {stage === 'input' && (
        <div className="q-container">
          <ArticleInput onSubmit={handleAnalyze} />
        </div>
      )}
      {stage === 'analyzing' && (
        <AnalyzingStage target={target} steps={analyzeSteps} activeLabel={activeStepLabel} />
      )}
      {stage === 'report' && result && (
        <div className="q-container" style={{ paddingTop: 24 }}>
          <CredibilityReport result={result} currentUrl={currentUrl} onReset={handleReset} />
        </div>
      )}

      {showMarketing && (
        <>
          <CostSection />
          <SignalsSection />
          <InspectorSection />
          <MethodSection />
          <AccessSection />
        </>
      )}
      </main>
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
