'use client'

import { AnalysisResult, RedFlag } from '@/types/analysis'
import { getSourceCredibility } from '@/lib/sourceDatabase'
import { useTranslation } from '@/lib/i18n'

interface CredibilityReportProps {
  result: AnalysisResult
  currentUrl: string | null
  onReset: () => void
}

function scoreColor(score: number): string {
  if (score >= 80) return 'var(--moss)'
  if (score >= 60) return 'oklch(0.60 0.13 75)'
  if (score >= 40) return 'oklch(0.62 0.18 55)'
  if (score >= 20) return 'var(--vermillion-2)'
  return 'var(--vermillion)'
}

function biasIndex(bias: string): number {
  const map: Record<string, number> = { left: -2, 'center-left': -1, center: 0, 'center-right': 1, right: 2 }
  return map[bias] ?? 0
}

export function CredibilityReport({ result, currentUrl, onReset }: CredibilityReportProps) {
  const { t } = useTranslation()
  const v = {
    color: scoreColor(result.overallScore),
    label: result.overallScore >= 80 ? t('report.reliable')
      : result.overallScore >= 60 ? t('report.moderate')
      : result.overallScore >= 40 ? t('report.questionable')
      : result.overallScore >= 20 ? t('report.low')
      : t('report.highRisk'),
    tone: result.overallScore >= 80 ? t('report.reliableTone')
      : result.overallScore >= 60 ? t('report.moderateTone')
      : result.overallScore >= 40 ? t('report.questionableTone')
      : result.overallScore >= 20 ? t('report.lowTone')
      : t('report.highRiskTone'),
  }

  const reportId = Math.random().toString(16).slice(2, 8).toUpperCase()
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()

  const sourceLookupUrl = currentUrl || (result.metadata.source ? `https://${result.metadata.source}` : '')
  const source = sourceLookupUrl ? getSourceCredibility(sourceLookupUrl) : null

  const flagCount = result.redFlags.length
  const flagText = flagCount === 1
    ? t('report.redFlagCount', { n: flagCount })
    : t('report.redFlagCountPlural', { n: flagCount })

  return (
    <section className="animate-fadeInUp" style={{ paddingTop: 10 }}>
      {/* Back + report ID */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button
          onClick={onReset}
          className="mono"
          style={{ fontSize: 12, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.16em', cursor: 'pointer' }}
        >
          {t('report.analyzeAnother')}
        </button>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
          REPORT · {reportDate} · ID #{reportId}
        </div>
      </div>

      {/* Hero verdict */}
      <div style={{
        borderTop: '2px solid var(--ink)',
        borderBottom: '2px solid var(--ink)',
        padding: '28px 0 32px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 32,
        alignItems: 'center',
      }}>
        <div>
          <p className="smcap" style={{ color: 'var(--vermillion)', margin: 0 }}>{t('report.theVerdict')}</p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(40px, 5.6vw, 80px)',
            lineHeight: 0.96,
            letterSpacing: '-0.025em',
            margin: '10px 0 0',
          }}>
            {result.metadata.title || 'Article analysis'}
          </h2>
          <p style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 22,
            color: 'var(--ink-2)',
            margin: '16px 0 0',
            lineHeight: 1.3,
            maxWidth: '55ch',
          }}>
            {v.tone}{' '}
            <span style={{ color: 'var(--vermillion)' }}>{flagText}</span>,{' '}
            <span style={{ color: v.color, fontStyle: 'normal', fontWeight: 600 }}>{result.overallScore}/100</span>.
          </p>
        </div>

        {/* Score + stamp */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 220 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              fontFamily: 'var(--serif)',
              fontWeight: 400,
              fontSize: 180,
              lineHeight: 0.85,
              letterSpacing: '-0.05em',
              color: v.color,
            }}>
              {String(result.overallScore).padStart(2, '0')}
              <span style={{ fontSize: 32, color: 'var(--ink-3)', verticalAlign: 'top', marginLeft: 4 }}>/100</span>
            </div>
            <div style={{ position: 'absolute', top: -10, right: -28, animation: 'stampIn 700ms cubic-bezier(.2,1.2,.4,1) 300ms both' }}>
              <div className="stamp" style={{ color: v.color, borderColor: v.color, boxShadow: `inset 0 0 0 1px ${v.color}` }}>
                {v.label}
              </div>
            </div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {t('report.overallCredibility')}
          </div>
        </div>
      </div>

      {/* Source dossier + Article slate */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)', gap: 24, marginTop: 40 }}>
        {source ? (
          <SourceDossier source={source} domain={result.metadata.source || ''} />
        ) : (
          <div style={{ border: '1px solid var(--paper-rule)', padding: '20px 22px', background: 'var(--paper-2)' }}>
            <p className="smcap" style={{ color: 'var(--ink-3)', margin: 0 }}>{t('report.sourceOnFile')}</p>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-2)', marginTop: 10 }}>
              {t('report.noSourceUrl')}
            </p>
          </div>
        )}
        <ArticleSlate metadata={result.metadata} />
      </div>

      {/* Triptych */}
      <Triptych result={result} />

      {/* Red flags */}
      {result.redFlags.length > 0 && <RedFlagsSection flags={result.redFlags} />}

      {/* Colophon */}
      <div style={{
        marginTop: 48,
        paddingTop: 20,
        borderTop: '2px solid var(--ink)',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 18,
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.14em',
        color: 'var(--ink-3)',
        textTransform: 'uppercase',
      }}>
        <div>{t('report.colophon')}</div>
        <div>{t('report.endOfReport')}</div>
      </div>
    </section>
  )
}

function SourceDossier({ source, domain }: { source: ReturnType<typeof getSourceCredibility>; domain: string }) {
  const { t } = useTranslation()
  const credColor = source.credibilityScore >= 80 ? 'var(--moss)'
    : source.credibilityScore >= 60 ? 'oklch(0.60 0.13 75)'
    : source.credibilityScore >= 40 ? 'oklch(0.62 0.18 55)'
    : 'var(--vermillion)'

  const biasIdx = biasIndex(source.bias)
  const biasLabelMap: Record<string, string> = {
    '-2': t('report.biasLeft'),
    '-1': t('report.biasCenterLeft'),
    '0':  t('report.biasCenter'),
    '1':  t('report.biasCenterRight'),
    '2':  t('report.biasRight'),
  }

  return (
    <div style={{ border: '1px solid var(--ink)', padding: '20px 22px 22px', background: 'var(--paper-2)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 12, right: 14, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.18em' }}>
        {t('report.dossierLabel')}
      </div>

      <p className="smcap" style={{ margin: 0, color: 'var(--vermillion)' }}>{t('report.sourceOnFile')}</p>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 34, margin: '6px 0 2px', lineHeight: 1.05 }}>
        {source.name}
      </h3>
      <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.06em' }}>{domain}</div>

      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 18, alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 56, lineHeight: 0.9, color: credColor }}>
          {source.credibilityScore}
        </div>
        <div>
          <div className="smcap" style={{ color: 'var(--ink-3)' }}>{t('report.credibilityOnRecord')}</div>
          <div style={{ display: 'flex', height: 8, marginTop: 8, background: 'var(--paper)', border: '1px solid var(--paper-rule)' }}>
            <div style={{ width: `${source.credibilityScore}%`, background: credColor }} />
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>0</span><span>50</span><span>100</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="smcap" style={{ color: 'var(--ink-3)' }}>{t('report.editorialBias')}</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 2 }}>
          {([-2, -1, 0, 1, 2] as const).map(v => (
            <div key={v} style={{
              flex: 1, height: 22,
              border: '1px solid var(--ink)',
              background: v === biasIdx ? 'var(--ink)' : 'transparent',
            }} />
          ))}
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>{t('report.biasLeft')}</span>
          <span>{t('report.biasCenterLeft')}</span>
          <span>{t('report.biasCenter')}</span>
          <span>{t('report.biasCenterRight')}</span>
          <span>{t('report.biasRight')}</span>
        </div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--ink)', letterSpacing: '0.1em', marginTop: 10, fontWeight: 600 }}>
          {biasLabelMap[String(biasIdx)] ?? t('report.biasCenter')}
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'grid', gap: 14 }}>
        {source.strengths && source.strengths.length > 0 && (
          <div>
            <div className="smcap" style={{ color: 'var(--ink-3)' }}>{t('report.onItsRecord')}</div>
            <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
              {source.strengths.map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--moss)', fontFamily: 'var(--mono)', fontWeight: 700 }}>+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {source.notableIssues && source.notableIssues.length > 0 && (
          <div>
            <div className="smcap" style={{ color: 'var(--ink-3)' }}>{t('report.onItsRapSheet')}</div>
            <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
              {source.notableIssues.map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--vermillion)', fontFamily: 'var(--mono)', fontWeight: 700 }}>!</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {source.factCheckerRating && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--paper-rule)' }}>
          <div className="smcap" style={{ color: 'var(--ink-3)' }}>{t('report.factCheckerNote')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, marginTop: 4 }}>
            &ldquo;{source.factCheckerRating}.&rdquo;
          </div>
        </div>
      )}
    </div>
  )
}

function ArticleSlate({ metadata }: { metadata: AnalysisResult['metadata'] }) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div>
        <p className="smcap" style={{ color: 'var(--vermillion)', margin: 0 }}>{t('report.articleSlate')}</p>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontStyle: 'italic', fontSize: 26, margin: '8px 0 0', lineHeight: 1.15, color: 'var(--ink-2)' }}>
          {t('report.articleSlateSubtitle')}
        </h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--ink)', borderLeft: '1px solid var(--ink)' }}>
        <SlateCell label={t('report.labelHeadline')} value={metadata.title || '—'} span />
        <SlateCell label={t('report.labelByline')}   value={metadata.author || '—'} />
        <SlateCell label={t('report.labelPublished')} value={metadata.publishedDate || '—'} />
        <SlateCell label={t('report.labelSource')}   value={metadata.source || '—'} mono />
      </div>
    </div>
  )
}

function SlateCell({ label, value, mono, span }: { label: string; value: string; mono?: boolean; span?: boolean }) {
  return (
    <div style={{
      borderRight: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)',
      padding: '12px 14px', gridColumn: span ? '1 / -1' : 'auto', background: 'var(--paper)',
    }}>
      <div className="smcap" style={{ color: 'var(--ink-3)' }}>{label}</div>
      <div style={{ marginTop: 4, fontFamily: mono ? 'var(--mono)' : 'var(--serif)', fontSize: mono ? 14 : 18, lineHeight: 1.25, color: 'var(--ink)' }}>
        {value}
      </div>
    </div>
  )
}

function Triptych({ result }: { result: AnalysisResult }) {
  const { t } = useTranslation()
  const passes = [
    { code: '01', name: t('report.pass01'), score: result.factRiskScore,      note: result.breakdown.factRisk },
    { code: '02', name: t('report.pass02'), score: result.biasScore,           note: result.breakdown.bias },
    { code: '03', name: t('report.pass03'), score: result.sensationalismScore, note: result.breakdown.sensationalism },
  ]
  return (
    <div style={{ marginTop: 44 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 className="smcap" style={{ color: 'var(--vermillion)', margin: 0 }}>{t('report.fourPassesDetail')}</h3>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>{t('report.higherMoreRisky')}</div>
      </div>
      <div style={{ borderTop: '1px solid var(--ink)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {passes.map((p, i) => <PassCell key={p.code} pass={p} isLast={i === 2} delay={i * 90} />)}
      </div>
    </div>
  )
}

function PassCell({ pass, isLast, delay }: { pass: { code: string; name: string; score: number; note: string }; isLast: boolean; delay: number }) {
  const danger = pass.score >= 60 ? 'var(--vermillion)' : pass.score >= 40 ? 'oklch(0.62 0.18 55)' : pass.score >= 20 ? 'oklch(0.60 0.13 75)' : 'var(--moss)'
  return (
    <div style={{ padding: '20px 22px 24px', borderRight: isLast ? 'none' : '1px solid var(--ink)', borderBottom: '1px solid var(--ink)', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--paper)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>{pass.code} · {pass.name}</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>/100</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 110 }}>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 96, lineHeight: 0.82, color: danger, letterSpacing: '-0.04em' }}>
          {pass.score}
        </div>
        <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', gap: 3 }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const filled = i < Math.round(pass.score / 5)
            return (
              <div key={i} style={{
                flex: 1, height: `${10 + i * 4}%`,
                background: filled ? danger : 'var(--paper-2)',
                border: `1px solid ${filled ? danger : 'var(--paper-rule)'}`,
                transformOrigin: 'bottom',
                animation: `barGrow 480ms cubic-bezier(.2,.8,.2,1) ${delay + i * 22}ms both`,
              }} />
            )
          })}
        </div>
      </div>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.35, color: 'var(--ink)', margin: 0 }}>{pass.note}</p>
    </div>
  )
}

function RedFlagsSection({ flags }: { flags: RedFlag[] }) {
  const { t } = useTranslation()
  const sevWeight = { high: 3, medium: 2, low: 1 }
  const sorted = [...flags].sort((a, b) => sevWeight[b.severity] - sevWeight[a.severity])
  const sevColor = (s: string) => s === 'high' ? 'var(--vermillion)' : s === 'medium' ? 'oklch(0.55 0.16 50)' : 'var(--ink-3)'
  const dotColor = (s: string) => s === 'high' ? 'var(--vermillion)' : s === 'medium' ? 'oklch(0.65 0.16 50)' : 'var(--ink-4)'
  const sevLabel = (s: string) => s === 'high' ? t('report.severityHigh') : s === 'medium' ? t('report.severityMedium') : t('report.severityLow')

  return (
    <div style={{ marginTop: 44 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 className="smcap" style={{ color: 'var(--vermillion)', margin: 0 }}>{t('report.redFlagsFootnotes')}</h3>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>
          {sorted.filter(f => f.severity === 'high').length} {t('report.severityHigh')} &nbsp;·&nbsp;
          {sorted.filter(f => f.severity === 'medium').length} {t('report.severityMedium')} &nbsp;·&nbsp;
          {sorted.filter(f => f.severity === 'low').length} {t('report.severityLow')}
        </div>
      </div>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, borderTop: '1px solid var(--ink)' }}>
        {sorted.map((flag, i) => (
          <li key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 120px 1fr auto', gap: 18, alignItems: 'baseline', padding: '18px 4px', borderBottom: '1px solid var(--paper-rule)' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1, color: 'var(--ink)', minWidth: 48 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', fontWeight: 600, color: sevColor(flag.severity), display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: dotColor(flag.severity), flexShrink: 0 }} />
              {sevLabel(flag.severity)}
            </span>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.2, color: 'var(--ink)' }}>{flag.type}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 4, fontFamily: 'var(--serif)', fontStyle: 'italic' }}>{flag.description}</div>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em' }}>FN.{String(i + 1).padStart(2, '0')}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
