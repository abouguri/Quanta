'use client'

import { FactCheckResult, Verdict } from '@/types/analysis'
import { useTranslation } from '@/lib/i18n'

interface ClaimCardProps {
  result: FactCheckResult
  index: number
}

const VERDICT_CONFIG: Record<Verdict, { labelKey: string; color: string; bg: string }> = {
  TRUE:        { labelKey: 'claim.verdictTrue',       color: 'var(--verified)',   bg: 'var(--tint-verified)'   },
  FALSE:       { labelKey: 'claim.verdictFalse',      color: 'var(--disputed)',   bg: 'var(--tint-disputed)'   },
  MISLEADING:  { labelKey: 'claim.verdictMisleading', color: 'var(--misleading)', bg: 'var(--tint-misleading)' },
  MIXED:       { labelKey: 'claim.verdictMixed',      color: 'var(--mixed)',      bg: 'var(--tint-mixed)'      },
  UNVERIFIED:  { labelKey: 'claim.verdictUnverified', color: 'var(--ink-3)',      bg: 'var(--paper-2)'         },
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

export function ClaimCard({ result, index }: ClaimCardProps) {
  const { t } = useTranslation()
  const cfg = VERDICT_CONFIG[result.verdict]

  return (
    <div style={{
      border: '1px solid var(--ink)',
      background: 'var(--paper)',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
    }}>
      {/* Index column */}
      <div style={{
        borderRight: '1px solid var(--ink)',
        padding: '20px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
        minWidth: 64,
        background: cfg.bg,
      }}>
        <span style={{
          fontFamily: 'var(--serif)',
          fontSize: 40,
          lineHeight: 1,
          color: cfg.color,
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="mono" style={{
          fontSize: 9,
          letterSpacing: '0.18em',
          fontWeight: 700,
          color: cfg.color,
          textTransform: 'uppercase',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}>
          {t(cfg.labelKey)}
        </span>
      </div>

      {/* Content column */}
      <div style={{ padding: '20px 22px', display: 'grid', gap: 14 }}>
        {/* Claim quote */}
        <blockquote style={{
          margin: 0,
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 18,
          lineHeight: 1.4,
          color: 'var(--ink)',
          borderLeft: `3px solid ${cfg.color}`,
          paddingLeft: 14,
        }}>
          &ldquo;{result.claim.text}&rdquo;
        </blockquote>

        {/* Claimant + topic tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {result.claim.claimant && (
            <span className="mono" style={{
              fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-2)',
              background: 'var(--paper-2)', border: '1px solid var(--paper-rule)',
              padding: '2px 8px',
            }}>
              {result.claim.claimant}
            </span>
          )}
          <span className="mono" style={{
            fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-3)',
            background: 'var(--paper-2)', border: '1px solid var(--paper-rule)',
            padding: '2px 8px', textTransform: 'uppercase',
          }}>
            {result.claim.topic}
          </span>
        </div>

        {/* Summary / reasoning */}
        <p style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.55,
          color: 'var(--ink-2)',
          fontFamily: 'var(--serif)',
        }}>
          {result.summary}
        </p>

        {/* Fact-check link + metadata */}
        <div style={{
          borderTop: '1px solid var(--paper-rule)',
          paddingTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {result.factCheckUrl ? (
              <a
                href={result.factCheckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mono"
                style={{
                  fontSize: 11, letterSpacing: '0.12em', color: cfg.color,
                  textDecoration: 'underline', textUnderlineOffset: 3,
                }}
              >
                {result.factCheckPublisher ?? t('claim.factCheckSource')} ↗
              </a>
            ) : (
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-3)' }}>
                {t('claim.noExternalSource')}
              </span>
            )}
            {result.factCheckRating && (
              <span className="mono" style={{
                fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-2)',
                background: cfg.bg, padding: '2px 8px', border: `1px solid ${cfg.color}`,
              }}>
                &ldquo;{result.factCheckRating}&rdquo;
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)' }}>
              {t(SOURCE_KEY[result.source])}
            </span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-3)' }}>
              {t(CONFIDENCE_KEY[result.confidence])}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
