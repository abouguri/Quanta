import type { BackgroundToPopup, PopupToBackground } from '@/lib/messages'
import { ANALYZE_PORT } from '@/lib/messages'
import { API_BASE_URL } from '@/lib/config'

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
        let payload: { error?: string; retryAfter?: number } = {}
        try { payload = await response.json() as typeof payload } catch { /* non-JSON */ }
        send({
          type: 'ERROR',
          message: payload.error ?? `HTTP ${response.status}`,
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
            if (parsed && typeof parsed.overallScore === 'number') {
              send({ type: 'RESULT', data: parsed })
            } else if (parsed && typeof parsed.progress === 'number') {
              send({ type: 'PROGRESS', status: String(parsed.status ?? ''), progress: parsed.progress })
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
