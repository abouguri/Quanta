import { useCallback, useEffect, useRef, useState } from 'react'
import { ANALYZE_PORT, type BackgroundToPopup } from '@/lib/messages'
import { getInstallId, recordAnalysisAttempt, saveAnalysis } from '@/lib/storage'
import type { AnalysisResult, ExtractedArticle } from '@/lib/types'

export type AnalyzePhase = 'idle' | 'measuring' | 'result' | 'error' | 'limit'

export interface AnalyzeState {
  phase: AnalyzePhase
  progress: number
  currentPass: number
  result: AnalysisResult | null
  error: string | null
  retryAfter: number | null
}

const INITIAL: AnalyzeState = { phase: 'idle', progress: 0, currentPass: 0, result: null, error: null, retryAfter: null }

export function useAnalyzePort() {
  const [state, setState] = useState<AnalyzeState>(INITIAL)
  const portRef = useRef<chrome.runtime.Port | null>(null)

  useEffect(() => () => { portRef.current?.disconnect() }, [])

  const reset = useCallback(() => {
    portRef.current?.disconnect()
    portRef.current = null
    setState(INITIAL)
  }, [])

  const start = useCallback(async (article: ExtractedArticle, language: string = 'en') => {
    setState({ phase: 'measuring', progress: 5, currentPass: 0, result: null, error: null, retryAfter: null })
    const installId = await getInstallId()
    await recordAnalysisAttempt()

    const port = chrome.runtime.connect({ name: ANALYZE_PORT })
    portRef.current = port

    port.onMessage.addListener((msg: BackgroundToPopup) => {
      if (msg.type === 'PROGRESS') {
        setState(s => ({
          ...s,
          progress: Math.max(s.progress, msg.progress),
          currentPass: typeof msg.pass === 'number' ? msg.pass : s.currentPass,
        }))
      } else if (msg.type === 'RESULT') {
        void saveAnalysis(msg.data, article.url)
        setState({ phase: 'result', progress: 100, currentPass: 4, result: msg.data, error: null, retryAfter: null })
      } else if (msg.type === 'ERROR') {
        if (msg.status === 429) {
          setState({ phase: 'limit', progress: 0, currentPass: 0, result: null, error: msg.message, retryAfter: msg.retryAfter ?? null })
        } else {
          setState({ phase: 'error', progress: 0, currentPass: 0, result: null, error: msg.message, retryAfter: null })
        }
      }
    })

    port.onDisconnect.addListener(() => {
      portRef.current = null
    })

    port.postMessage({
      type: 'START',
      payload: {
        articleText: article.textContent,
        articleUrl: article.url,
        language,
        installId,
      },
    })
  }, [])

  const cancel = useCallback(() => {
    portRef.current?.postMessage({ type: 'CANCEL' })
    reset()
  }, [reset])

  return { state, start, reset, cancel }
}
