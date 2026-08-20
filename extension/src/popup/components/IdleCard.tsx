import type { ExtractedArticle } from '@/lib/types'

interface Props {
  article: ExtractedArticle | null
  status: 'loading' | 'ready' | 'empty' | 'error'
  errorMessage?: string
  canAnalyze: boolean
  onAnalyze: () => void
}

export function IdleCard({ article, status, errorMessage, canAnalyze, onAnalyze }: Props) {
  if (status === 'loading') {
    return (
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="measure-bars" aria-hidden><span /><span /><span /><span /></div>
        <span className="q-mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Reading page…
        </span>
      </div>
    )
  }

  if (status === 'empty' || !article) {
    return (
      <>
        <div className="card">
          <div className="q-eyebrow">Not an article</div>
          <p style={{ margin: '8px 0 0', fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.45, color: 'var(--ink)' }}>
            We couldn’t find readable article text on this page.
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-4)' }}>
            Open a news article or blog post and try again.
          </p>
        </div>
        <button className="btn-primary" disabled>Analyze this page</button>
      </>
    )
  }

  if (status === 'error') {
    return (
      <div className="banner error">
        <div>
          <div className="q-eyebrow" style={{ color: 'var(--disputed)' }}>Couldn’t read page</div>
          <div style={{ marginTop: 4 }}>{errorMessage ?? 'Unknown error'}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="card">
        <div className="eyebrow-row">
          <span className="q-mono q-eyebrow">{article.siteName ?? hostnameFromUrl(article.url) ?? 'Detected'}</span>
          <span className="q-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>
            {Math.round(article.length / 5)} words · est.
          </span>
        </div>
        <h2 className="card-title" style={{ marginTop: 8 }}>{article.title ?? 'Untitled article'}</h2>
        {article.byline && (
          <div className="card-meta">
            <span>{article.byline}</span>
          </div>
        )}
      </div>
      <button className="btn-primary" disabled={!canAnalyze} onClick={onAnalyze}>
        Measure this article <span>→</span>
      </button>
    </>
  )
}

function hostnameFromUrl(url: string): string | null {
  try { return new URL(url).hostname } catch { return null }
}
