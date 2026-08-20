'use client'

import { FactCheckResult, Verdict } from '@/types/analysis'
import { useTranslation } from '@/lib/i18n'

interface ClaimCardProps {
  result: FactCheckResult
  index: number
  open: boolean
  onToggle: () => void
}

const VERDICT_CONFIG: Record<Verdict, { labelKey: string; tone: string }> = {
  TRUE:        { labelKey: 'claim.verdictTrue',       tone: 'var(--verified)' },
  FALSE:       { labelKey: 'claim.verdictFalse',      tone: 'var(--unsupported)' },
  MISLEADING:  { labelKey: 'claim.verdictMisleading', tone: 'var(--misleading)' },
  MIXED:       { labelKey: 'claim.verdictMixed',      tone: 'var(--contested)' },
  UNVERIFIED:  { labelKey: 'claim.verdictUnverified', tone: 'var(--unknown)' },
}

const SOURCE_KEY: Record<FactCheckResult['source'], string> = {
  factcheck_db:   'claim.sourceFactcheckDb',
  web_search:     'claim.sourceWebSearch',
  llm_assessment: 'claim.sourceLlmAssessment',
}

const CONFIDENCE_KEY: Record<FactCheckResult['confidence'], string> = {
  high:   'claim.confidenceHigh',
  medium: 'claim.confidenceMedium',
  low:    'claim.confidenceLow',
}

/** One row of the report's claim ledger. Collapsed to a single line by default; expands in place. */
export function ClaimCard({ result, index, open, onToggle }: ClaimCardProps) {
  const { t } = useTranslation()
  const cfg = VERDICT_CONFIG[result.verdict]

  return (
    <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '56px 130px minmax(0,1fr) 170px 24px',
          gap: 20,
          alignItems: 'baseline',
          padding: '20px 0',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--paper)',
        }}
      >
        <span className="mono" style={{ fontSize: 12, letterSpacing: '0.14em', color: '#7d7b74' }}>
          {String(index + 1).padStart(3, '0')}
        </span>
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: cfg.tone, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: 7, background: cfg.tone, flexShrink: 0 }} />
          {t(cfg.labelKey)}
        </span>
        <span style={{ fontSize: 17, lineHeight: 1.4 }}>{result.claim.text}</span>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7d7b74' }}>
          {t(SOURCE_KEY[result.source])}
        </span>
        <span className="mono" style={{ fontSize: 14, color: 'var(--accent)', textAlign: 'right' }}>{open ? '−' : '+'}</span>
      </button>

      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 200ms cubic-bezier(0,0,.2,1)' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '176px minmax(0,1fr)', gap: 20, padding: '0 0 24px' }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7d7b74', lineHeight: 2 }}>
              <div>{t(CONFIDENCE_KEY[result.confidence])}</div>
              {result.claim.claimant && <div>{result.claim.claimant}</div>}
              <div>{result.claim.topic}</div>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: '#a3a19b', maxWidth: '76ch' }}>{result.summary}</p>
              {result.factCheckUrl ? (
                <a
                  href={result.factCheckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono"
                  style={{ display: 'inline-block', marginTop: 12, fontSize: 11, letterSpacing: '0.1em', color: cfg.tone }}
                >
                  {result.factCheckPublisher ?? t('claim.factCheckSource')}
                  {result.factCheckRating ? ` · "${result.factCheckRating}"` : ''} ↗
                </a>
              ) : (
                <div className="mono" style={{ marginTop: 12, fontSize: 11, letterSpacing: '0.1em', color: '#7d7b74' }}>
                  {t('claim.noExternalSource')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
