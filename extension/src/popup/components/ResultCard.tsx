import type { AnalysisResult } from '@/lib/types'
import { ScoreRing } from './ScoreRing'
import { RedFlagList } from './RedFlagList'
import { API_BASE_URL } from '@/lib/config'

function toneFor(score: number): { color: string; label: string } {
  if (score >= 70) return { color: 'var(--verified)', label: 'Well-supported' }
  if (score >= 50) return { color: 'var(--mixed)', label: 'Needs context' }
  if (score >= 30) return { color: 'var(--mixed)', label: 'Mixed signals' }
  return { color: 'var(--disputed)', label: 'Read with caution' }
}

export function ResultCard({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const tone = toneFor(result.overallScore)
  const claims = result.claims ?? []
  const disputedClaims = claims.filter(c => ['FALSE', 'MISLEADING', 'MIXED'].includes(c.verdict)).length
  const subscores: Array<[string, number, string]> = [
    ['Structure', result.structural.score, 'var(--verified)'],
    ['Claims checked', Math.min(100, claims.length * 20), 'var(--mixed)'],
    ['Disputed claims', Math.min(100, disputedClaims * 25), 'var(--disputed)'],
  ]
  return (
    <div className="measure">
      <div className="card">
        <div className="score-block">
          <ScoreRing score={result.overallScore} color={tone.color} />
          <div style={{ minWidth: 0 }}>
            <span className="score-tone" style={{ color: tone.color, background: `color-mix(in oklab, ${tone.color} 14%, transparent)` }}>
              ● {tone.label}
            </span>
            <h2 className="card-title" style={{ marginTop: 8, fontSize: 16, WebkitLineClamp: 3 }}>
              {result.metadata.title ?? 'Untitled article'}
            </h2>
            <div className="card-meta">
              {result.metadata.source && <span>{result.metadata.source}</span>}
              {result.metadata.author && <><span className="dot" /><span>{result.metadata.author}</span></>}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="section-title">Breakdown</div>
        <div className="card subscores">
          {subscores.map(([label, val, color]) => (
            <div key={label} className="subscore-row">
              <span className="subscore-label">{label}</span>
              <div className="subscore-bar"><div style={{ width: `${val}%`, background: color }} /></div>
              <span className="subscore-val" style={{ color }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="section-title">Signals</div>
        <div className="card" style={{ display: 'grid', gap: 10 }}>
          <div>
            <div className="q-eyebrow">Article structure</div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--graphite)', lineHeight: 1.5 }}>
              {result.structural.metrics.hasAuthor ? 'Author found' : 'No author found'} ·{' '}
              {result.structural.metrics.hasDate ? 'date found' : 'no date found'} ·{' '}
              {result.structural.metrics.articleLength.toLocaleString()} characters measured.
            </p>
          </div>
          {claims.length > 0 && (
            <div>
              <div className="q-eyebrow">Claim verification</div>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--graphite)', lineHeight: 1.5 }}>
                {claims.length} claim{claims.length === 1 ? '' : 's'} checked · {disputedClaims} disputed or mixed.
              </p>
            </div>
          )}
        </div>
      </div>

      <RedFlagList flags={result.structural.flags ?? []} />

      <div style={{ display: 'grid', gap: 8 }}>
        <button className="btn-primary" onClick={onReset}>Measure another</button>
        <a className="btn-ghost" href={`${API_BASE_URL}/?from=ext`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Open full report ↗
        </a>
      </div>
    </div>
  )
}
