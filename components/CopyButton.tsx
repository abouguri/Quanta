'use client'

import { AnalysisResult } from '@/types/analysis'
import { copyResultsToClipboard } from '@/lib/copy'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface CopyButtonProps {
  result: AnalysisResult
}

type CopyState = 'idle' | 'copied' | 'failed'

export function CopyButton({ result }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle')
  const { t } = useTranslation()

  const handleCopy = async () => {
    // The clipboard API rejects without permission or outside a secure
    // context. The button used to swallow that and simply do nothing.
    const success = await copyResultsToClipboard(result)
    setState(success ? 'copied' : 'failed')
    setTimeout(() => setState('idle'), 2000)
  }

  const accent = state === 'copied' ? 'var(--verified)'
    : state === 'failed' ? 'var(--disputed)'
    : null

  return (
    <button
      onClick={handleCopy}
      className="mono"
      style={{
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '6px 12px',
        borderRadius: 6,
        cursor: 'pointer',
        border: '0.5px solid var(--fog)',
        color: accent ?? 'var(--ink-2)',
        borderColor: accent ?? 'var(--fog)',
        background: 'transparent',
        whiteSpace: 'nowrap',
      }}
    >
      {state === 'copied' ? t('copy.copied') : state === 'failed' ? t('copy.failed') : t('copy.button')}
    </button>
  )
}
