import type { BackgroundToPopup, PopupToBackground } from '@/lib/messages'
import type { AnalysisErrorCode } from '@/lib/types'

// Inlined to keep the service worker free of shared chunks — Chrome MV3 module
// SWs can fail to register ("Status code: 2") when their imports cross
// generated chunk boundaries. Source of truth lives in @/lib/messages and
// @/lib/config; mirror any changes here.
const ANALYZE_PORT = 'analyze'
const API_BASE_URL = 'https://factnews-six.vercel.app'
const STEP_TO_PASS: Record<string, number> = {
  structural: 1,
  extracting: 2,
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== ANALYZE_PORT) return

  const controller = new AbortController()

  const send = (msg: BackgroundToPopup) => {
    try { port.postMessage(msg) } catch { /* port closed */ }
  }

  port.onMessage.addListener(async (msg: PopupToBackground) => {
    if (msg.type === 'CANCEL') {
      controller.abort()
      return
    }
    if (msg.type !== 'START') return

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Quanta-Install-Id': msg.payload.installId,
        },
        body: JSON.stringify({
          articleText: msg.payload.articleText,
          articleUrl: msg.payload.articleUrl,
          language: msg.payload.language ?? 'en',
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        let payload: { error?: string; code?: AnalysisErrorCode; retryAfter?: number } = {}
        try { payload = await response.json() as typeof payload } catch { /* non-JSON */ }
        send({
          type: 'ERROR',
          message: payload.error ?? `HTTP ${response.status}`,
          code: payload.code,
          retryAfter: payload.retryAfter,
          status: response.status,
        })
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        send({ type: 'ERROR', message: 'No response stream' })
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let nl: number
        while ((nl = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, nl)
          buffer = buffer.slice(nl + 2)
          if (!frame.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(frame.slice(6))
            if (parsed && typeof parsed.error === 'string') {
              send({ type: 'ERROR', message: parsed.error, code: parsed.code })
            } else if (parsed && typeof parsed.overallScore === 'number') {
              send({ type: 'RESULT', data: parsed })
            } else if (parsed && typeof parsed.progress === 'number') {
              const step = typeof parsed.step === 'string' ? parsed.step : undefined
              const claimMatch = step?.match(/^claim_(\d+)$/)
              send({
                type: 'PROGRESS',
                status: String(parsed.label ?? parsed.status ?? ''),
                progress: parsed.progress,
                pass: typeof parsed.pass === 'number'
                  ? parsed.pass
                  : claimMatch
                    ? 3
                    : step
                      ? STEP_TO_PASS[step]
                      : undefined,
                step,
                label: typeof parsed.label === 'string' ? parsed.label : undefined,
              })
            }
          } catch {
            // ignore parse errors on partial frames
          }
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return
      send({ type: 'ERROR', message: err instanceof Error ? err.message : 'Network error' })
    }
  })

  port.onDisconnect.addListener(() => controller.abort())
})
