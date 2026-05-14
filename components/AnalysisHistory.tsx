'use client'

import { useState, useEffect } from 'react'
import { AnalysisHistory as AnalysisHistoryEntry, getHistory, clearHistory } from '@/lib/history'
import { useTranslation } from '@/lib/i18n'

interface AnalysisHistoryProps {
  onSelect: (entry: AnalysisHistoryEntry) => void
  currentUrl?: string | null
  refreshKey?: number
}

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--moss)'
  if (score >= 60) return 'oklch(0.60 0.13 75)'
  if (score >= 40) return 'oklch(0.62 0.18 55)'
  return 'var(--vermillion)'
}

export function AnalysisHistory({ onSelect, currentUrl, refreshKey }: AnalysisHistoryProps) {
  const { t } = useTranslation()
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setHistory(getHistory())
    setMounted(true)
  }, [refreshKey])

  const handleClear = () => {
    if (confirm(t('history.confirmClear'))) {
      clearHistory()
      setHistory([])
    }
  }

  return (
    <aside style={{
      borderLeft: '1px solid var(--paper-rule)',
      paddingLeft: 28,
      position: 'sticky',
      top: 32,
      alignSelf: 'start',
      maxHeight: 'calc(100vh - 64px)',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <p className="smcap" style={{ color: 'var(--vermillion)', margin: 0 }}>{t('history.title')}</p>
        {mounted && history.length > 0 && (
          <button
            onClick={handleClear}
            className="mono"
            style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            {t('history.clearAll')}
          </button>
        )}
      </div>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-2)', margin: '0 0 18px', fontSize: 14 }}>
        {t('history.subtitle')}
      </p>

      {!mounted || history.length === 0 ? (
        <div style={{
          padding: '32px 12px',
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 12,
          color: 'var(--ink-3)',
          letterSpacing: '0.1em',
          border: '1px dashed var(--paper-rule)',
          whiteSpace: 'pre-line',
        }}>
          {t('history.empty')}
        </div>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {history.map((entry) => (
            <HistoryItem
              key={entry.id}
              entry={entry}
              active={!!currentUrl && currentUrl === entry.url}
              onSelect={onSelect}
            />
          ))}
        </ol>
      )}
    </aside>
  )
}

function HistoryItem({
  entry, active, onSelect,
}: {
  entry: AnalysisHistoryEntry
  active: boolean
  onSelect: (e: AnalysisHistoryEntry) => void
}) {
  const { t } = useTranslation()
  const c = scoreColor(entry.score)

  const sourceName = entry.result?.metadata?.source
    || (entry.url ? (() => { try { return new URL(entry.url!).hostname.replace(/^www\./, '') } catch { return '' } })() : '')

  const whenAgo = (() => {
    const diffMs = Date.now() - entry.date
    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMs / 3600000)
    const days = Math.floor(diffMs / 86400000)
    if (mins < 1) return t('history.justNow')
    if (mins < 60) return t('history.minutesAgo', { count: mins })
    if (hours < 24) return t('history.hoursAgo', { count: hours })
    if (days < 7) return t('history.daysAgo', { count: days })
    return new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })()

  return (
    <li>
      <button
        onClick={() => onSelect(entry)}
        style={{
          width: '100%',
          textAlign: 'left',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 14,
          padding: '14px 8px 16px',
          borderBottom: '1px solid var(--paper-rule)',
          cursor: 'pointer',
          background: active ? 'var(--paper-2)' : 'transparent',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 0.9, color: c, letterSpacing: '-0.02em' }}>
            {entry.score}
          </div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)', letterSpacing: '0.16em', marginTop: 2 }}>/100</div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {sourceName}{sourceName ? ' · ' : ''}{whenAgo}
          </div>
          <div style={{
            fontFamily: 'var(--serif)',
            fontSize: 16,
            lineHeight: 1.18,
            color: 'var(--ink)',
            marginTop: 4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}>
            {entry.title || entry.url || 'Untitled'}
          </div>
        </div>
      </button>
    </li>
  )
}
