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
      className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
        copied
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {copied ? t('copy.copied') : t('copy.button')}
    </button>
  )
}
