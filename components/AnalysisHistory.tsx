'use client'

import type { AnalysisHistory } from '@/lib/history'
import { getHistory, deleteHistoryEntry, clearHistory } from '@/lib/history'
import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

export function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [mounted, setMounted] = useState(false)
  const { t, language } = useTranslation()

  useEffect(() => {
    setHistory(getHistory())
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!history.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">{t('history.empty')}</p>
      </div>
    )
  }

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id)
    setHistory(getHistory())
  }

  const handleClearAll = () => {
    if (confirm(t('history.confirmClear'))) {
      clearHistory()
      setHistory([])
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - timestamp
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('history.justNow')
    if (diffMins < 60) return t('history.minutesAgo', { count: diffMins })
    if (diffHours < 24) return t('history.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('history.daysAgo', { count: diffDays })
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">{t('history.title')} ({history.length})</h3>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            {t('history.clearAll')}
          </button>
        )}
      </div>
      {history.map((entry) => (
        <div
          key={entry.id}
          className="border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-bold text-lg ${getScoreColor(entry.score)}`}>
                  {entry.score}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(entry.date)}
                </span>
              </div>
              {entry.title && (
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{entry.title}</p>
              )}
              {entry.url && (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block"
                >
                  {new URL(entry.url).hostname}
                </a>
              )}
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
              className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-sm"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
