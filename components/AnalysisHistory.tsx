'use client'

import { useState, useEffect } from 'react'
import { AnalysisHistory as AnalysisHistoryEntry, getHistory, clearHistory } from '@/lib/history'
import { useTranslation } from '@/lib/i18n'

interface AnalysisHistoryProps {
  onSelect: (entry: AnalysisHistoryEntry) => void
  currentUrl?: string | null
  refreshKey?: number
  open: boolean
  onClose: () => void
}

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--verified)'
  if (score >= 60) return 'var(--contested)'
  if (score >= 40) return 'var(--misleading-soft)'
  return 'var(--unsupported)'
}

/** A slide-over panel, not a persistent sidebar — opened from the nav's History button. */
export function AnalysisHistory({ onSelect, currentUrl, refreshKey, open, onClose }: AnalysisHistoryProps) {
  const { t } = useTranslation()
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    getHistory().then(h => {
      setHistory(h)
      setMounted(true)
    })
  }, [refreshKey, open])

  const handleClear = async () => {
    if (confirm(t('history.confirmClear'))) {
      await clearHistory()
      setHistory([])
    }
  }

  const handleSelect = (entry: AnalysisHistoryEntry) => {
    onSelect(entry)
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90 }}
      />
      <aside
        className="animate-fadeIn"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(400px, 100vw)',
          background: 'var(--paper)',
          borderLeft: '1px solid var(--ghost)',
          padding: '28px 28px 40px',
          overflowY: 'auto',
          zIndex: 91,
          boxShadow: '-24px 0 60px rgba(0,0,0,0.24)',
        }}
      >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <p className="smcap" style={{ color: 'var(--accent)', margin: 0 }}>{t('history.title')}</p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {mounted && history.length > 0 && (
            <button
              onClick={handleClear}
              className="mono"
              style={{ fontSize: 10, color: 'var(--grey)', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              {t('history.clearAll')}
            </button>
          )}
          <button onClick={onClose} className="mono" style={{ fontSize: 14, color: 'var(--grey)', cursor: 'pointer' }} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
      <p style={{ fontFamily: 'var(--sans)', color: 'var(--ink-2)', margin: '0 0 18px', fontSize: 14 }}>
        {t('history.subtitle')}
      </p>

      {!mounted ? (
        <div style={{
          padding: '32px 12px',
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 12,
          color: 'var(--ink-3)',
          letterSpacing: '0.1em',
        }}>
          {t('history.loading')}
        </div>
      ) : history.length === 0 ? (
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
              onSelect={handleSelect}
            />
          ))}
        </ol>
      )}
      </aside>
    </>
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
          <div className="mono" style={{ fontSize: 30, lineHeight: 0.9, color: c, letterSpacing: '-0.02em' }}>
            {entry.score}
          </div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--grey)', letterSpacing: '0.16em', marginTop: 2 }}>/100</div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--grey)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {sourceName}{sourceName ? ' · ' : ''}{whenAgo}
          </div>
          <div style={{
            fontFamily: 'var(--sans)',
            fontSize: 16,
            lineHeight: 1.25,
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
