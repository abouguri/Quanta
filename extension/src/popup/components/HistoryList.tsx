import { useEffect, useState } from 'react'
import { getHistory } from '@/lib/storage'
import type { HistoryEntry } from '@/lib/types'

function scoreColor(score: number): string {
  if (score >= 70) return 'var(--verified)'
  if (score >= 50) return 'var(--mixed)'
  return 'var(--disputed)'
}

export function HistoryList({ onPick }: { onPick: (entry: HistoryEntry) => void }) {
  const [items, setItems] = useState<HistoryEntry[]>([])

  useEffect(() => { void getHistory().then(setItems) }, [])

  if (items.length === 0) return null

  return (
    <div>
      <div className="section-title">Recent</div>
      <div className="history">
        {items.slice(0, 5).map(entry => (
          <button key={entry.id} className="history-row" onClick={() => onPick(entry)}>
            <span className="title">{entry.title ?? entry.url ?? 'Untitled'}</span>
            <span className="score" style={{ color: scoreColor(entry.score) }}>{entry.score}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
