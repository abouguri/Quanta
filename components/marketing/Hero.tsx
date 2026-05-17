import { useState, useRef } from 'react'
import { COLORS, FONTS, SPACING, TONE_HEX, TONE_LABEL, SAMPLE_ANALYSES } from '@/lib/marketing-constants'

interface HeroProps {
  onAnalyzeUrl?: (url: string) => void
}

type Phase = 'idle' | 'measuring' | 'result'

export function MarketingHero({ onAnalyzeUrl }: HeroProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [url, setUrl] = useState('https://apnews.com/fed-rates-march-2026')
  const inputRef = useRef<HTMLInputElement>(null)

  const SAMPLE_KEYS = Object.keys(SAMPLE_ANALYSES)
  const DEFAULT_URL = 'https://apnews.com/fed-rates-march-2026'

  const lookupResult = (searchUrl: string) => {
    const u = (searchUrl || '').toLowerCase()
    const hit = SAMPLE_KEYS.find((k) => u.includes(k.split('/')[0]))
    return SAMPLE_ANALYSES[hit as keyof typeof SAMPLE_ANALYSES || 'apnews.com/fed-rates-march-2026']
  }

  const result = phase === 'result' ? lookupResult(url) : null

  const onMeasure = (e: React.FormEvent) => {
    e.preventDefault()
    const target = url || DEFAULT_URL
    setUrl(target)
    setPhase('measuring')
    onAnalyzeUrl?.(target)
    // Simulate measurement completion
    setTimeout(() => setPhase('result'), 2600)
  }

  const onReset = () => {
    setPhase('idle')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <section style={{ padding: `${SPACING[12]} 0 ${SPACING[20]}` }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: `0 ${SPACING[10]}` }}>
        <div style={{ color: TONE_HEX.verified, fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: SPACING[5] }}>
          ● The credibility layer for the internet
        </div>

        <h1 style={{
          fontFamily: FONTS.sans,
          fontSize: 'clamp(48px, 7vw, 88px)',
          fontWeight: 500,
          lineHeight: 1.02,
          letterSpacing: '-0.03em',
          margin: `${SPACING[5]} 0 0`,
          color: COLORS['ink-navy'],
        }}>
          Measure.<br />
          Understand.<br />
          Elevate<span style={{ color: TONE_HEX.verified, marginLeft: '-4px' }}>.</span>
        </h1>

        <p style={{
          fontFamily: FONTS.serif,
          fontStyle: 'italic',
          fontSize: '22px',
          lineHeight: 1.45,
          color: COLORS.graphite,
          margin: `${SPACING[8]} 0 0`,
          maxWidth: '50ch',
        }}>
          Paste a news article. Quanta measures bias, evidence, source provenance, and confidence — and shows its work, sentence by sentence. Read with your eyes open.
        </p>

        {/* URL Input */}
        <form onSubmit={onMeasure} style={{ marginTop: SPACING[10] }}>
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            background: COLORS.paper,
            border: `1px solid ${COLORS['ink-navy']}`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: phase === 'idle' ? 'none' : `0 0 0 4px rgba(15,34,51,0.05)`,
            transition: 'box-shadow 200ms',
          }}>
            <span style={{
              padding: `0 ${SPACING[4]}`,
              alignSelf: 'center',
              fontFamily: FONTS.mono,
              fontSize: '11px',
              color: COLORS.slate,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              borderRight: `0.5px solid ${COLORS.fog}`,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
            }}>
              URL
            </span>
            <input
              ref={inputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={phase === 'measuring'}
              placeholder="https://"
              spellCheck={false}
              style={{
                flex: 1,
                minWidth: 0,
                border: 0,
                background: 'transparent',
                outline: 'none',
                padding: `${SPACING[5]} ${SPACING[4]}`,
                fontFamily: FONTS.mono,
                fontSize: '14px',
                color: COLORS['ink-navy'],
              }}
            />
            <button
              type="submit"
              disabled={phase === 'measuring'}
              style={{
                background: COLORS['ink-navy'],
                color: COLORS.bone,
                border: 0,
                padding: `0 ${SPACING[8]}`,
                fontFamily: FONTS.sans,
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '0.01em',
                cursor: phase === 'measuring' ? 'not-allowed' : 'pointer',
                opacity: phase === 'measuring' ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: SPACING[2],
              }}
            >
              {phase === 'measuring' ? 'Measuring…' : <>Measure <span>→</span></>}
            </button>
          </div>
        </form>

        {/* Sample chips */}
        {phase === 'idle' && (
          <div style={{ marginTop: SPACING[4], display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: SPACING[2] }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: '10px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
              Try one
            </span>
            {SAMPLE_KEYS.map((k) => {
              const host = k.split('/')[0]
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setUrl(`https://${k}`)
                    setPhase('measuring')
                    setTimeout(() => setPhase('result'), 2600)
                  }}
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: '11px',
                    background: 'transparent',
                    border: `0.5px solid ${COLORS.fog}`,
                    color: COLORS['ink-navy'],
                    padding: `${SPACING[1]} ${SPACING[3]}`,
                    borderRadius: SPACING[4],
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  {host} ↗
                </button>
              )
            })}
          </div>
        )}

        {/* Result Panel */}
        {phase === 'result' && result && (
          <ResultPanel data={result} onReset={onReset} />
        )}
      </div>
    </section>
  )
}

function ResultPanel({ data, onReset }: { data: typeof SAMPLE_ANALYSES[keyof typeof SAMPLE_ANALYSES]; onReset: () => void }) {
  const toneHex = TONE_HEX[data.signal]
  return (
    <div style={{
      background: COLORS.paper,
      border: `0.5px solid ${COLORS.fog}`,
      borderRadius: '14px',
      padding: `${SPACING[8]} ${SPACING[10]}`,
      marginTop: SPACING[6],
      animation: 'fadeIn 360ms ease-out',
    }}>
      {/* Header: meta + score */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: SPACING[10],
        alignItems: 'start',
        paddingBottom: SPACING[6],
        borderBottom: `0.5px solid ${COLORS.fog}`,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING[2], marginBottom: SPACING[2] }}>
            <span style={{
              fontFamily: FONTS.mono,
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: toneHex,
              background: `${toneHex}1F`,
              padding: `${SPACING[1]} ${SPACING[2]}`,
              borderRadius: SPACING[1],
            }}>
              ● {TONE_LABEL[data.signal]}
            </span>
            <span style={{ fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              {data.host} · {data.published} · {data.readTime}
            </span>
            <span style={{
              fontFamily: FONTS.mono,
              fontSize: '9px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: COLORS.slate,
              border: `0.5px solid ${COLORS.fog}`,
              padding: `2px 6px`,
              borderRadius: '3px',
              marginLeft: 'auto',
            }}>
              Demo · cached sample
            </span>
          </div>
          <h2 style={{
            fontFamily: FONTS.serif,
            fontWeight: 400,
            fontSize: '30px',
            lineHeight: 1.18,
            letterSpacing: '-0.01em',
            color: COLORS['ink-navy'],
            margin: '0 0 10px',
          }}>
            {data.headline}
          </h2>
          <div style={{ fontFamily: FONTS.mono, fontSize: '12px', color: COLORS.slate }}>
            by {data.author}
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: 160 }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.slate, marginBottom: SPACING[1] }}>
            Credibility
          </div>
          <div style={{
            fontFamily: FONTS.sans,
            fontVariantNumeric: 'tabular-nums',
            fontSize: '92px',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 0.88,
            color: toneHex,
          }}>
            {data.overall}
            <span style={{ fontSize: '22px', color: COLORS.slate, fontWeight: 400, verticalAlign: 'top', marginLeft: SPACING[1] }}>/100</span>
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: SPACING[2] }}>
            Confidence · {data.confidence}%
          </div>
        </div>
      </div>

      {/* Fingerprint */}
      <div style={{ paddingTop: SPACING[6] }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: SPACING[4] }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.slate }}>
            Fingerprint · 5 dimensions
          </div>
          <button
            onClick={onReset}
            style={{
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              fontFamily: FONTS.mono,
              fontSize: '11px',
              color: COLORS.slate,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              padding: 0,
            }}
          >
            ↻ Measure another
          </button>
        </div>

        <div style={{ display: 'grid', gap: '2px' }}>
          {data.dimensions.map((d, i) => (
            <div
              key={d.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 56px',
                gap: SPACING[4],
                alignItems: 'center',
                padding: `${SPACING[2]} 0`,
                borderTop: i === 0 ? 0 : `0.5px solid ${COLORS.fog}`,
              }}
            >
              <span style={{ fontSize: '14px', color: COLORS['ink-navy'], fontWeight: 500 }}>
                {d.label}
              </span>
              <div style={{
                height: '5px',
                background: COLORS.mist,
                borderRadius: '3px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    height: '100%',
                    background: TONE_HEX[d.tone],
                    borderRadius: '3px',
                    width: `${d.value}%`,
                    animation: `qfill 800ms cubic-bezier(.2,.7,.2,1) ${0.05 * i}s both`,
                  }}
                />
              </div>
              <span style={{
                fontFamily: FONTS.mono,
                fontSize: '15px',
                textAlign: 'right',
                color: TONE_HEX[d.tone],
                fontWeight: 600,
              }}>
                {d.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ marginTop: SPACING[6], padding: `${SPACING[4]} ${SPACING[5]}`, border: `0.5px dashed ${COLORS.fog}`, borderRadius: '10px' }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.ember, marginBottom: SPACING[2] }}>
          Why {data.overall}?
        </div>
        <p style={{
          margin: 0,
          fontFamily: FONTS.serif,
          fontStyle: 'italic',
          fontSize: '17px',
          lineHeight: 1.5,
          color: COLORS['ink-navy'],
        }}>
          {data.summary}
        </p>
      </div>
    </div>
  )
}
