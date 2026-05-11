'use client'

import { useState } from 'react'

interface ArticleInputProps {
  onSubmit: (url: string | null, text: string) => void
  disabled?: boolean
}

export function ArticleInput({ onSubmit, disabled = false }: ArticleInputProps) {
  const [tab, setTab] = useState<'url' | 'text'>('url')
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')

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
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('url')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'url'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Paste URL
        </button>
        <button
          onClick={() => setTab('text')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'text'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Paste Text
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'url' ? (
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://example.com/article"
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:bg-gray-100 text-gray-900 placeholder-gray-500"
        />
      ) : (
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste article text here (min 100 characters)..."
          disabled={disabled}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:bg-gray-100 text-gray-900 placeholder-gray-500 font-mono text-sm"
        />
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isReady || disabled}
        className="w-full px-6 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed rounded-none"
      >
        {disabled ? 'Analyzing...' : 'Analyze Credibility'}
      </button>

      {tab === 'text' && (
        <p className="text-xs text-gray-500">
          {textInput.length} characters ({textInput.length < 100 ? 'min 100 required' : '✓'})
        </p>
      )}
    </div>
  )
}
