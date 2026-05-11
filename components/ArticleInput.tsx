'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface ArticleInputProps {
  onSubmit: (url: string | null, text: string) => void
  disabled?: boolean
}

export function ArticleInput({ onSubmit, disabled = false }: ArticleInputProps) {
  const [tab, setTab] = useState<'url' | 'text'>('url')
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const { t } = useTranslation()

  const handleSubmit = () => {
    if (tab === 'url' && urlInput.trim()) {
      onSubmit(urlInput.trim(), '')
    } else if (tab === 'text' && textInput.trim()) {
      onSubmit(null, textInput.trim())
    }
  }

  const isReady = tab === 'url' ? urlInput.trim().length > 0 : textInput.trim().length > 100

  return (
    <div className="w-full space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTab('url')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'url'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t('input.urlTab')}
        </button>
        <button
          onClick={() => setTab('text')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'text'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t('input.textTab')}
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'url' ? (
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={t('input.urlPlaceholder')}
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      ) : (
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t('input.textPlaceholder')}
          disabled={disabled}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-800 dark:focus:ring-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm"
        />
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isReady || disabled}
        className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-800 text-white font-medium hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed rounded-none"
      >
        {disabled ? t('input.analyzingButton') : t('input.submitButton')}
      </button>

      {tab === 'text' && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {textInput.length} {t('input.charactersLabel')} ({textInput.length < 100 ? `${t('input.textTab')} 100 required` : '✓'})
        </p>
      )}
    </div>
  )
}
