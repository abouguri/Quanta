'use client'

import { useState, useEffect } from 'react'
import { AnalysisHistory as AnalysisHistoryEntry, getHistory, clearHistory } from '@/lib/history'

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

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function AnalysisHistory({ onSelect, currentUrl, refreshKey }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setHistory(getHistory())
    setMounted(true)
  }, [refreshKey])

  if (!mounted) return <HistoryShell><HistoryEmpty /></HistoryShell>

  const handleClear = () => {
    if (confirm('Clear all analysis history?')) {
      clearHistory()
      setHistory([])
    }
  }

  return (
    <HistoryShell onClear={history.length > 0 ? handleClear : undefined}>
      {history.length === 0 ? (
        <HistoryEmpty />
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
    </HistoryShell>
  )
}

function HistoryShell({
  children,
  onClear,
}: {
  children: React.ReactNode
  onClear?: () => void
}) {
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
        <p className="smcap" style={{ color: 'var(--vermillion)', margin: 0 }}>The archive</p>
        {onClear && (
          <button
            onClick={onClear}
            className="mono"
            style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Clear all
          </button>
        )}
      </div>
      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-2)', margin: '0 0 18px', fontSize: 14 }}>
        Recent passes, stored locally on this device.
      </p>
      {children}
    </aside>
  )
}

function HistoryEmpty() {
  return (
    <div style={{
      padding: '32px 12px',
      textAlign: 'center',
      fontFamily: 'var(--mono)',
      fontSize: 12,
      color: 'var(--ink-3)',
      letterSpacing: '0.1em',
      border: '1px dashed var(--paper-rule)',
    }}>
      NO ENTRIES YET.<br />
      ANALYZE AN ARTICLE TO BEGIN.
    </div>
  )
}

function HistoryItem({
  entry,
  active,
  onSelect,
}: {
  entry: AnalysisHistoryEntry
  active: boolean
  onSelect: (e: AnalysisHistoryEntry) => void
}) {
  const c = scoreColor(entry.score)
  const sourceName = entry.result?.metadata?.source || (entry.url ? (() => { try { return new URL(entry.url!).hostname.replace(/^www\./, '') } catch { return '' } })() : '')

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
            {sourceName}{sourceName ? ' · ' : ''}{timeAgo(entry.date)}
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
