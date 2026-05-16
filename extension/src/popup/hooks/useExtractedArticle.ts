import { useEffect, useState } from 'react'
import type { ExtractedArticle } from '@/lib/types'

type State =
  | { status: 'loading' }
  | { status: 'ready'; article: ExtractedArticle }
  | { status: 'empty' }
  | { status: 'error'; message: string }

export function useExtractedArticle(): State {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!tab?.id) {
          if (!cancelled) setState({ status: 'error', message: 'No active tab' })
          return
        }
        if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-extension://')) {
          if (!cancelled) setState({ status: 'empty' })
          return
        }
        const response = await chrome.tabs.sendMessage<{ type: 'EXTRACT' }, ExtractedArticle | null>(tab.id, { type: 'EXTRACT' })
        if (cancelled) return
        if (!response || !response.textContent || response.textContent.length < 100) {
          setState({ status: 'empty' })
        } else {
          setState({ status: 'ready', article: response })
        }
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Could not read page'
        setState({ status: 'error', message })
      }
    })()

    return () => { cancelled = true }
  }, [])

  return state
}
