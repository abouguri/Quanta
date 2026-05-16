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
  // Sub-scores are inverted from raw scores (risk/bias/sensationalism = higher is worse;
  // we display them as-is since the labels make the direction obvious).
  const subscores: Array<[string, number, string]> = [
    ['Fact risk',       result.factRiskScore,       'var(--disputed)'],
    ['Bias',            result.biasScore,           'var(--mixed)'],
    ['Sensationalism',  result.sensationalismScore, 'var(--mixed)'],
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

      {(result.breakdown.factRisk || result.breakdown.bias || result.breakdown.sensationalism) && (
        <div>
          <div className="section-title">Why</div>
          <div className="card" style={{ display: 'grid', gap: 10 }}>
            {result.breakdown.factRisk && (
              <div>
                <div className="q-eyebrow">Fact risk</div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--graphite)', lineHeight: 1.5 }}>{result.breakdown.factRisk}</p>
              </div>
            )}
            {result.breakdown.bias && (
              <div>
                <div className="q-eyebrow">Bias</div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--graphite)', lineHeight: 1.5 }}>{result.breakdown.bias}</p>
              </div>
            )}
            {result.breakdown.sensationalism && (
              <div>
                <div className="q-eyebrow">Sensationalism</div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--graphite)', lineHeight: 1.5 }}>{result.breakdown.sensationalism}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <RedFlagList flags={result.redFlags ?? []} />

      <div style={{ display: 'grid', gap: 8 }}>
        <button className="btn-primary" onClick={onReset}>Measure another</button>
        <a className="btn-ghost" href={`${API_BASE_URL}/?from=ext`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Open full report ↗
        </a>
      </div>
    </div>
  )
}
