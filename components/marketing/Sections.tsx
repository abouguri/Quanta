import { COLORS, FONTS, SPACING, TONE_HEX, TONE_LABEL, SIGNALS_DATA, COMPARISON_ROWS } from '@/lib/marketing-constants'

export function TrustStrip() {
  const stats = [
    { label: 'Articles measured', value: '2,418,036' },
    { label: 'Outlets indexed', value: '14,820' },
    { label: 'Languages', value: '118' },
    { label: 'Median analysis time', value: '4.3 sec' },
  ]

  return (
    <section style={{
      borderTop: `0.5px solid ${COLORS.fog}`,
      borderBottom: `0.5px solid ${COLORS.fog}`,
      background: COLORS.mist,
    }}>
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: `${SPACING[6]} ${SPACING[10]}`,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr auto',
        alignItems: 'center',
        gap: SPACING[8],
      }}>
        {stats.map((stat, i) => (
          <div key={stat.label}>
            {i > 0 && <span style={{ height: '32px', borderLeft: `0.5px solid ${COLORS.fog}` }} />}
            <div style={{ fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.16em' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: '28px', fontWeight: 500, color: COLORS['ink-navy'], fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SignalCard({ signal }: { signal: typeof SIGNALS_DATA[0] }) {
  const tone = TONE_HEX[signal.tone]
  return (
    <article style={{
      display: 'flex',
      flexDirection: 'column',
      background: COLORS.paper,
      border: `0.5px solid ${COLORS.fog}`,
      borderRadius: '12px',
      padding: `${SPACING[8]} ${SPACING[8]} ${SPACING[8]}`,
      minHeight: 320,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          Signal {signal.code}
        </span>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: tone,
          display: 'inline-block',
        }} />
      </div>
      <h3 style={{
        margin: `${SPACING[4]} 0 ${SPACING[1]}`,
        fontFamily: FONTS.sans,
        fontWeight: 500,
        fontSize: '26px',
        letterSpacing: '-0.015em',
        color: COLORS['ink-navy'],
      }}>
        {signal.name}
      </h3>
      <div style={{
        fontFamily: FONTS.serif,
        fontStyle: 'italic',
        fontSize: '17px',
        color: COLORS.graphite,
        lineHeight: 1.4,
        marginBottom: SPACING[4],
      }}>
        {signal.short}
      </div>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, color: COLORS.slate }}>
        {signal.detail}
      </p>

      <div style={{
        marginTop: 'auto',
        paddingTop: SPACING[6],
        borderTop: `0.5px solid ${COLORS.fog}`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: SPACING[4],
        alignItems: 'baseline',
      }}>
        {Object.entries(signal.sample).map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: FONTS.mono, fontSize: '10px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              {k}
            </div>
            <div style={{
              fontFamily: FONTS.sans,
              fontWeight: 500,
              fontSize: '24px',
              color: COLORS['ink-navy'],
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
              marginTop: SPACING[1],
            }}>
              {v}
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export function HowItWorks() {
  return (
    <section id="how" style={{ padding: `${SPACING[20]} 0 ${SPACING[20]}`, scrollMarginTop: '96px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: `0 ${SPACING[10]}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: SPACING[16], alignItems: 'start', marginBottom: SPACING[12] }}>
          <div>
            <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.slate }}>
              How it works
            </div>
            <h2 style={{
              fontFamily: FONTS.sans,
              fontSize: 'clamp(36px, 4vw, 56px)',
              margin: `${SPACING[4]} 0 0`,
              color: COLORS['ink-navy'],
              letterSpacing: '-0.025em',
              lineHeight: 1.04,
              fontWeight: 500,
            }}>
              Bias is a<br />
              fingerprint,<br />
              not a slider.
            </h2>
          </div>
          <div>
            <p style={{
              margin: 0,
              fontFamily: FONTS.serif,
              fontSize: '22px',
              fontStyle: 'italic',
              lineHeight: 1.5,
              color: COLORS.graphite,
            }}>
              Every Quanta analysis decomposes an article into four measurements. None of them is a verdict. All of them are auditable down to the sentence.
            </p>
            <p style={{ marginTop: SPACING[4], fontSize: '16px', lineHeight: 1.6, color: COLORS.slate }}>
              We don&apos;t say <em>true</em> or <em>false</em>. We say <span style={{ fontFamily: FONTS.mono, color: COLORS['ink-navy'] }}>78% confidence</span>, with these citations, on this methodology. Confidence intervals beat verdicts.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: SPACING[4],
        }}>
          {SIGNALS_DATA.map((s) => (
            <SignalCard key={s.code} signal={s} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function ComparePreview() {
  return (
    <section id="compare" style={{ padding: `${SPACING[6]} 0 ${SPACING[20]}`, scrollMarginTop: '96px' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: `0 ${SPACING[10]}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: SPACING[6] }}>
          <div>
            <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.slate }}>
              Compare · one story, eight outlets
            </div>
            <h2 style={{
              margin: `${SPACING[4]} 0 0`,
              fontFamily: FONTS.sans,
              fontSize: 'clamp(30px, 3vw, 44px)',
              color: COLORS['ink-navy'],
              letterSpacing: '-0.02em',
              fontWeight: 500,
            }}>
              How the same story was framed.
            </h2>
          </div>
          <span style={{ fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            Story · Fed holds rates · Apr 27, 2026
          </span>
        </div>

        <div style={{
          background: COLORS.paper,
          border: `0.5px solid ${COLORS.fog}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 140px 100px 72px',
            padding: `${SPACING[4]} ${SPACING[6]}`,
            background: COLORS.mist,
            borderBottom: `0.5px solid ${COLORS.fog}`,
            alignItems: 'center',
            gap: SPACING[4],
          }}>
            {['Outlet', 'Headline', 'Framing', 'Score', ''].map((h) => (
              <div key={h} style={{ fontFamily: FONTS.mono, fontSize: '10px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((r, i) => {
            const tone = TONE_HEX[r.tone]
            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 140px 100px 72px',
                  padding: `${SPACING[4]} ${SPACING[6]}`,
                  borderTop: i === 0 ? 0 : `0.5px solid ${COLORS.fog}`,
                  alignItems: 'center',
                  gap: SPACING[4],
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: '12px', color: COLORS['ink-navy'] }}>
                  {r.host}
                </span>
                <span style={{
                  fontFamily: FONTS.serif,
                  fontSize: '16px',
                  lineHeight: 1.3,
                  color: COLORS['ink-navy'],
                }}>
                  {r.headline}
                </span>
                <span style={{ fontSize: '13px', color: COLORS.slate }}>
                  {r.framing}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: SPACING[1],
                }}>
                  <span style={{
                    fontFamily: FONTS.sans,
                    fontWeight: 500,
                    fontSize: '22px',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                    color: tone,
                  }}>
                    {r.score}
                  </span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: '10px', color: COLORS.slate }}>
                    /100
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: 56,
                    height: 4,
                    borderRadius: 2,
                    background: COLORS.mist,
                    overflow: 'hidden',
                  }}>
                    <div style={{ width: `${r.score}%`, height: '100%', background: tone, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{
          marginTop: SPACING[6],
          padding: `${SPACING[4]} ${SPACING[6]}`,
          border: `0.5px dashed ${COLORS.fog}`,
          borderRadius: '10px',
        }}>
          <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.slate }}>
            What this view shows
          </div>
          <p style={{
            margin: `${SPACING[2]} 0 0`,
            fontFamily: FONTS.serif,
            fontStyle: 'italic',
            fontSize: '17px',
            lineHeight: 1.5,
            color: COLORS['ink-navy'],
          }}>
            The same story, across eight outlets. Source diversity ranges from 2 to 14 unique citations. Framing variance is 3.4× the topic average.
          </p>
        </div>
      </div>
    </section>
  )
}

export function Methodology() {
  return (
    <section
      id="method"
      style={{
        background: COLORS['ink-navy'],
        color: COLORS.bone,
        padding: `${SPACING[20]} 0`,
        position: 'relative',
        scrollMarginTop: '96px',
      }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: `0 ${SPACING[10]}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING[20], alignItems: 'start' }}>
          <div>
            <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.ember }}>
              ● Methodology
            </div>
            <h2 style={{
              fontFamily: FONTS.sans,
              fontSize: 'clamp(40px, 5vw, 68px)',
              margin: `${SPACING[4]} 0 0`,
              color: COLORS.bone,
              letterSpacing: '-0.025em',
              lineHeight: 1.04,
              fontWeight: 500,
            }}>
              Show the work
              <span style={{ color: COLORS.ember }}>—</span> every time.
            </h2>
            <p style={{
              marginTop: SPACING[8],
              fontFamily: FONTS.serif,
              fontStyle: 'italic',
              fontSize: '22px',
              lineHeight: 1.5,
              color: '#CFCFC2',
              maxWidth: '32ch',
            }}>
              If Quanta can&apos;t defend an output, Quanta doesn&apos;t produce it. Every score traces to specific sentences, citations, and reasoning.
            </p>

            <div style={{ marginTop: SPACING[10], display: 'grid', gap: SPACING[4], maxWidth: 460 }}>
              {[
                ['Calibrated, not categorical', 'Confidence intervals, never verdicts.'],
                ['Article-level, not outlet-level', 'We rate the piece in front of you.'],
                ['Multi-dimensional, not a slider', 'Five signals, one fingerprint.'],
                ['Auditable down to the sentence', 'Click any score to see the language.'],
              ].map(([t, d]) => (
                <div key={t} style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr',
                  gap: SPACING[4],
                  alignItems: 'baseline',
                  padding: `${SPACING[4]} 0`,
                  borderTop: '0.5px solid #1F3D5A',
                }}>
                  <span style={{ color: COLORS.ember, fontFamily: FONTS.mono, fontSize: 12, letterSpacing: '0.04em' }}>→</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 16, color: COLORS.bone }}>
                      {t}
                    </div>
                    <div style={{ marginTop: SPACING[1], fontSize: 14, color: '#A6B3C4' }}>
                      {d}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: methodology card */}
          <div style={{
            background: '#142F4A',
            border: '0.5px solid #1F3D5A',
            borderRadius: '14px',
            padding: `${SPACING[6]} ${SPACING[8]}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 80px rgba(0,0,0,0.32)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING[4] }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: '11px', color: '#A6B3C4', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                Methodology / Framing
              </span>
              <span style={{ fontFamily: FONTS.mono, fontSize: '10px', color: COLORS.ember }}>
                v 1.4.0
              </span>
            </div>

            <h3 style={{
              margin: 0,
              fontFamily: FONTS.serif,
              fontWeight: 400,
              fontSize: 26,
              color: COLORS.bone,
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
            }}>
              &quot;The Fed&apos;s decision was widely expected by economists.&quot; <span style={{ color: '#A6B3C4', fontStyle: 'italic', fontSize: 18 }}>— attributed once, sourced from an analyst note.</span>
            </h3>

            <div style={{
              marginTop: SPACING[6],
              paddingTop: SPACING[6],
              borderTop: '0.5px solid #1F3D5A',
              display: 'grid',
              gap: SPACING[4],
            }}>
              {[
                { code: 'F-01', name: 'Voice diversity', w: 70 },
                { code: 'F-02', name: 'Attribution density', w: 56 },
                { code: 'F-03', name: 'Sentiment loading', w: 31 },
                { code: 'F-04', name: 'Hedging language', w: 82 },
              ].map((r) => (
                <div key={r.code} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 40px', gap: SPACING[4], alignItems: 'center' }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.ember }}>
                    {r.code}
                  </span>
                  <span style={{ fontSize: '13px', color: COLORS.bone }}>
                    {r.name}
                  </span>
                  <div style={{ height: 3, background: '#1F3D5A', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${r.w}%`, height: '100%', background: COLORS.ember }} />
                  </div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: '12px', color: COLORS.bone, textAlign: 'right' }}>
                    {r.w}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: SPACING[6],
              padding: `${SPACING[4]} ${SPACING[4]}`,
              background: 'rgba(232,163,61,0.07)',
              border: '0.5px solid rgba(232,163,61,0.4)',
              borderRadius: '8px',
            }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: '10px', color: COLORS.ember, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                Weighting
              </div>
              <p style={{ margin: `${SPACING[1]} 0 0`, fontSize: '13px', color: '#CFCFC2', lineHeight: 1.55 }}>
                Framing balance contributes 18% to the overall score. Updated quarterly with a public changelog.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ember accent */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${COLORS.ember}, transparent)`,
        opacity: 0.6,
      }} />
    </section>
  )
}

export function QuoteStrip() {
  return (
    <section style={{ padding: `${SPACING[20]} 0 ${SPACING[10]}` }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: `0 ${SPACING[10]}`, textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.slate }}>
          What it sounds like
        </div>
        <p style={{
          margin: `${SPACING[5]} auto 0`,
          fontFamily: FONTS.serif,
          fontSize: 'clamp(28px, 3vw, 40px)',
          fontWeight: 400,
          lineHeight: 1.25,
          letterSpacing: '-0.015em',
          color: COLORS['ink-navy'],
          maxWidth: '24ch',
        }}>
          &quot;78% confidence. Three of five citations led to primary sources. The framing leans slightly <span style={{ fontStyle: 'italic' }}>—</span> read another view too.&quot;
        </p>
        <div style={{ marginTop: SPACING[6], fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          — Quanta, on a typical Tuesday
        </div>
      </div>
    </section>
  )
}

export function CTAFooter() {
  return (
    <footer id="cta" style={{
      background: COLORS.mist,
      borderTop: `0.5px solid ${COLORS.fog}`,
      padding: `${SPACING[20]} 0 ${SPACING[10]}`,
      marginTop: SPACING[10],
      scrollMarginTop: '96px',
    }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: `0 ${SPACING[10]}` }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: SPACING[16],
          alignItems: 'end',
          paddingBottom: SPACING[16],
          borderBottom: `0.5px solid ${COLORS.fog}`,
        }}>
          <div>
            <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.slate }}>
              ● Start reading
            </div>
            <h2 style={{
              fontFamily: FONTS.sans,
              fontSize: 'clamp(40px, 5vw, 72px)',
              margin: `${SPACING[4]} 0 0`,
              color: COLORS['ink-navy'],
              letterSpacing: '-0.025em',
              lineHeight: 1.02,
              fontWeight: 500,
            }}>
              A measurement instrument <span style={{ color: COLORS.ember }}>—</span> in your pocket.
            </h2>
            <p style={{
              marginTop: SPACING[6],
              maxWidth: '50ch',
              fontFamily: FONTS.serif,
              fontStyle: 'italic',
              fontSize: '20px',
              lineHeight: 1.5,
              color: COLORS.graphite,
            }}>
              Install the extension, paste a link, or pipe articles through the API. Three free analyses a day, forever. No card required.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[4], alignItems: 'flex-start' }}>
            <a
              href="#"
              style={{
                background: COLORS['ink-navy'],
                color: COLORS.bone,
                padding: `${SPACING[4]} ${SPACING[6]}`,
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
                cursor: 'pointer',
                border: `1px solid ${COLORS['ink-navy']}`,
                borderRadius: '8px',
              }}
            >
              Install the browser extension
            </a>
            <a
              href="#"
              style={{
                background: 'transparent',
                color: COLORS['ink-navy'],
                padding: `${SPACING[4]} ${SPACING[6]}`,
                fontSize: '15px',
                fontWeight: 500,
                textDecoration: 'none',
                cursor: 'pointer',
                border: `1px solid ${COLORS['ink-navy']}`,
                borderRadius: '8px',
              }}
            >
              Open quanta.news →
            </a>
            <div style={{ fontFamily: FONTS.mono, fontSize: '11px', color: COLORS.slate, textTransform: 'uppercase', letterSpacing: '0.16em', marginTop: SPACING[1] }}>
              Chrome · Safari · Firefox · Edge
            </div>
          </div>
        </div>

        {/* Footer columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr',
          gap: SPACING[10],
          padding: `${SPACING[12]} 0 ${SPACING[8]}`,
        }}>
          <div>
            <div style={{ fontFamily: FONTS.sans, fontSize: '14px', fontWeight: 600 }}>
              Quanta<span style={{ color: COLORS.ember }}>.</span>
            </div>
            <p style={{ marginTop: SPACING[4], fontSize: '14px', color: COLORS.slate, lineHeight: 1.55, maxWidth: '32ch' }}>
              Quanta is the credibility layer for the internet. Independent and ad-free — revenue from subscriptions and the API.
            </p>
          </div>
          {[
            ['Product', ['Web app', 'Browser extension', 'Mobile (iOS, Android)', 'API', 'Pricing']],
            ['For', ['Readers', 'Students & educators', 'Journalists', 'Newsrooms', 'Researchers']],
            ['Open', ['Methodology', 'Changelog', 'Advisory board', 'Bias audits', 'Research papers']],
            ['Company', ['About', 'Manifesto', 'Press', 'Careers', 'Contact']],
          ].map(([title, items]) => (
            <div key={String(title)}>
              <div style={{ fontFamily: FONTS.sans, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.16em', color: COLORS.slate }}>
                {title}
              </div>
              <ul style={{ margin: `${SPACING[4]} 0 0`, padding: 0, listStyle: 'none', display: 'grid', gap: SPACING[2] }}>
                {items.map((it) => (
                  <li key={it}>
                    <a href="#" style={{ fontSize: '14px', color: COLORS['ink-navy'], textDecoration: 'none' }}>
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: SPACING[6],
          borderTop: `0.5px solid ${COLORS.fog}`,
          fontFamily: FONTS.mono,
          fontSize: '11px',
          color: COLORS.slate,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
        }}>
          <span>Quanta · v1.4.0 · © 2026 · Measure. Understand. Elevate.</span>
          <span>
            status: <span style={{ color: '#2E7D5B' }}>● all systems measuring</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
