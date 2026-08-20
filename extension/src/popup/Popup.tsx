import { useCallback, useState } from 'react'
import { Monogram } from './components/Monogram'
import { IdleCard } from './components/IdleCard'
import { MeasuringCard } from './components/MeasuringCard'
import { ResultCard } from './components/ResultCard'
import { HistoryList } from './components/HistoryList'
import { RateLimitPill, RateLimitBanner } from './components/RateLimitBanner'
import { useExtractedArticle } from './hooks/useExtractedArticle'
import { useAnalyzePort } from './hooks/useAnalyzePort'
import { useRateLimit } from './hooks/useRateLimit'
import type { AnalysisResult, HistoryEntry } from '@/lib/types'
import { API_BASE_URL } from '@/lib/config'

export function Popup() {
  const extracted = useExtractedArticle()
  const analyze = useAnalyzePort()
  const { state: rate, refresh: refreshRate } = useRateLimit()
  const [pinnedResult, setPinnedResult] = useState<AnalysisResult | null>(null)

  const overLimit = !rate.loading && rate.remaining <= 0
  const article = extracted.status === 'ready' ? extracted.article : null

  const onAnalyze = useCallback(() => {
    if (!article) return
    void analyze.start(article)
  }, [article, analyze])

  const onReset = useCallback(() => {
    setPinnedResult(null)
    analyze.reset()
    void refreshRate()
  }, [analyze, refreshRate])

  const onPickHistory = useCallback((entry: HistoryEntry) => {
    setPinnedResult(entry.result)
  }, [])

  let body: React.ReactNode

  if (pinnedResult) {
    body = <ResultCard result={pinnedResult} onReset={onReset} />
  } else if (analyze.state.phase === 'measuring') {
    body = <MeasuringCard currentPass={analyze.state.currentPass} progress={analyze.state.progress} onCancel={analyze.cancel} />
  } else if (analyze.state.phase === 'result' && analyze.state.result) {
    body = <ResultCard result={analyze.state.result} onReset={onReset} />
  } else if (analyze.state.phase === 'limit') {
    body = <RateLimitBanner resetsInMs={rate.resetsInMs} />
  } else if (analyze.state.phase === 'error') {
    body = (
      <>
        <div className="banner error">
          <div>
            <div className="q-eyebrow" style={{ color: 'var(--disputed)' }}>Analysis failed</div>
            <div style={{ marginTop: 4 }}>{analyze.state.error}</div>
          </div>
        </div>
        <button className="btn-ghost" onClick={onReset}>Try again</button>
      </>
    )
  } else if (overLimit) {
    body = (
      <>
        <RateLimitBanner resetsInMs={rate.resetsInMs} />
        <IdleCard
          article={article}
          status={extracted.status === 'ready' ? 'ready' : extracted.status}
          errorMessage={extracted.status === 'error' ? extracted.message : undefined}
          canAnalyze={false}
          onAnalyze={() => undefined}
        />
      </>
    )
  } else {
    body = (
      <IdleCard
        article={article}
        status={extracted.status === 'ready' ? 'ready' : extracted.status}
        errorMessage={extracted.status === 'error' ? extracted.message : undefined}
        canAnalyze={extracted.status === 'ready' && !overLimit}
        onAnalyze={onAnalyze}
      />
    )
  }

  const showHistory =
    !pinnedResult &&
    (analyze.state.phase === 'idle' || analyze.state.phase === 'limit') &&
    extracted.status !== 'loading'

  return (
    <div className="shell">
      <header className="shell-header">
        <a className="wordmark" href={API_BASE_URL} target="_blank" rel="noreferrer">
          <Monogram size={26} />
          <span>Quanta<span className="q-dot">.</span></span>
        </a>
        {!rate.loading && <RateLimitPill used={rate.used} remaining={rate.remaining} />}
      </header>

      <main className="shell-main">
        {body}
        {showHistory && <HistoryList onPick={onPickHistory} />}
      </main>

      <footer className="shell-footer">
        <span>truth, measured</span>
        <a href={API_BASE_URL} target="_blank" rel="noreferrer">quanta ↗</a>
      </footer>
    </div>
  )
}
