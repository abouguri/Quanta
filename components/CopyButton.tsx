'use client'

import { AnalysisResult } from '@/types/analysis'
import { copyResultsToClipboard } from '@/lib/copy'
import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface CopyButtonProps {
  result: AnalysisResult
}

export function CopyButton({ result }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const handleCopy = async () => {
    const success = await copyResultsToClipboard(result)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
        color: copied ? 'var(--verified)' : 'var(--ink-2)',
        borderColor: copied ? 'var(--verified)' : 'var(--fog)',
        background: 'transparent',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? t('copy.copied') : t('copy.button')}
    </button>
  )
}
