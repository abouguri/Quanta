'use client'

import { useTranslation } from '@/lib/i18n'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSelector } from '@/components/LanguageSelector'

const TONE_HEX: Record<string, string> = {
  // Token references, not literals: the dark theme is a token swap, and a
  // hardcoded hex here silently keeps the light value.
  verified: 'var(--verified)',
  mixed:    'var(--mixed)',
  disputed: 'var(--disputed)',
  unclear:  'var(--unclear)',
}

export function QuantaNav({ onHome }: { onHome: () => void }) {
  const { t } = useTranslation()
  const links: Array<[string, string]> = [
    [t('nav.howItWorks'), '#how'],
    [t('nav.methodology'), '#method'],
    [t('nav.pricing'), '#pricing'],
    [t('nav.forTeams'), '#teams'],
    [t('nav.api'), '#api'],
  ]
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'color-mix(in oklab, var(--bone) 88%, transparent)',
      backdropFilter: 'saturate(140%) blur(8px)',
      WebkitBackdropFilter: 'saturate(140%) blur(8px)',
      borderBottom: '0.5px solid var(--fog)',
    }}>
      <div className="q-container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 40px',
      }}>
        <button onClick={onHome} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'transparent', border: 0 }}>
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#0F2233"/>
            <circle cx="32" cy="30" r="13" stroke="#F4F1E9" strokeWidth="2.5" fill="none"/>
            <circle cx="44" cy="42" r="3.2" fill="#E6A23C"/>
          </svg>
          <span style={{
            fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 22,
            letterSpacing: '-0.02em', color: 'var(--ink)',
          }}>
            Quanta<span className="q-dot">.</span>
          </span>
        </button>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {links.map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{l}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSelector />
          <ThemeToggle />
          <a href="#cta" className="q-btn">{t('nav.installExtension')}</a>
        </div>
      </div>
    </header>
  )
}

export function TrustStrip() {
  const stats: Array<[string, React.ReactNode]> = [
    ['Articles measured', '2,418,036'],
    ['Outlets indexed',   '14,820'],
    ['Languages',         '118'],
    ['Median analysis time', <>4.3<span style={{ fontSize: 16, color: 'var(--ink-4)', marginLeft: 4 }}>sec</span></>],
  ]
  return (
    <section style={{
      borderTop: '0.5px solid var(--fog)',
      borderBottom: '0.5px solid var(--fog)',
      background: 'var(--mist)',
    }}>
      <div className="q-container" style={{
        padding: '24px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 28,
      }}>
        {stats.map(([label, value], i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 28, flex: i < 3 ? '1 1 0' : 'none' }}>
            <div>
              <div className="q-mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>{label}</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</div>
            </div>
            {i < 3 && <span style={{ height: 32, borderLeft: '0.5px solid var(--fog)' }} />}
          </div>
        ))}
      </div>
    </section>
  )
}

const SIGNALS = [
  { code: '01', name: 'Evidence',
    short: 'How well-supported are the central claims?',
    detail: 'Every claim is identified and traced. We count primary citations, secondary citations, and unsupported assertions. A claim without a verifiable source isn’t flagged as false — it’s flagged as unverified.',
    sample: { Verified: 14, Partial: 5, Unsupported: 2 }, tone: 'verified' },
  { code: '02', name: 'Source provenance',
    short: 'Where do the citations actually lead?',
    detail: 'Citations are followed. A press release counts differently than a peer-reviewed study or a regulatory filing. Circular citations — where outlets cite each other instead of the source — are surfaced.',
    sample: { Primary: 9, Secondary: 6, Circular: 2 }, tone: 'verified' },
  { code: '03', name: 'Framing',
    short: 'Whose perspective is missing?',
    detail: 'We map the named voices, attribution patterns, and which side of an issue receives more space. Framing isn’t left vs. right — it’s a fingerprint that shows what the article emphasizes.',
    sample: { 'Voices A': 62, 'Voices B': 28, Neutral: 10 }, tone: 'mixed' },
  { code: '04', name: 'Confidence',
    short: 'How sure are we of our own analysis?',
    detail: 'Every score comes with a confidence interval. A short opinion piece gets lower confidence than a 2,000-word investigation. We’d rather say "we don’t know yet" than guess.',
    sample: { '± conf.': '94%' }, tone: 'verified' },
]

function SignalCard({ s }: { s: typeof SIGNALS[number] }) {
  const tone = TONE_HEX[s.tone]
  return (
    <article style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--paper)',
      border: '0.5px solid var(--fog)',
      borderRadius: 12,
      padding: '26px 28px 28px',
      minHeight: 320,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span className="q-mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Signal {s.code}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: tone, display: 'inline-block' }} />
      </div>
      <h3 style={{
        margin: '14px 0 6px',
        fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 26,
        letterSpacing: '-0.015em', color: 'var(--ink)',
      }}>{s.name}</h3>
      <div style={{
        fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17,
        color: 'var(--graphite)', lineHeight: 1.4, marginBottom: 14,
      }}>{s.short}</div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--ink-4)' }}>{s.detail}</p>
      <div style={{
        marginTop: 'auto', paddingTop: 20,
        borderTop: '0.5px solid var(--fog)',
        display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'baseline',
      }}>
        {Object.entries(s.sample).map(([k, v]) => (
          <div key={k}>
            <div className="q-mono" style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{k}</div>
            <div style={{
              fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 24,
              color: 'var(--ink)', fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em', marginTop: 2,
            }}>{v}</div>
          </div>
        ))}
      </div>
    </article>
  )
}

export function HowItWorks() {
  return (
    <section id="how" className="q-anchor" style={{ padding: '120px 0 96px' }}>
      <div className="q-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, alignItems: 'start', marginBottom: 56 }}>
          <div>
            <div className="q-eyebrow" style={{ color: 'var(--ember)' }}>How it works</div>
            <h2 style={{
              fontFamily: 'var(--sans)', fontWeight: 500,
              fontSize: 'clamp(36px, 4vw, 56px)',
              margin: '14px 0 0',
              color: 'var(--ink)',
              letterSpacing: '-0.025em', lineHeight: 1.04,
            }}>
              Bias is a<br/>fingerprint,<br/>not a slider.
            </h2>
          </div>
          <div>
            <p style={{
              margin: 0, fontFamily: 'var(--serif)',
              fontSize: 22, fontStyle: 'italic', lineHeight: 1.5,
              color: 'var(--graphite)',
            }}>
              Every Quanta analysis decomposes an article into four measurements. None of them is a verdict.
              All of them are auditable down to the sentence.
            </p>
            <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.6, color: 'var(--ink-4)' }}>
              We don’t say <em>true</em> or <em>false</em>. We say <span className="q-mono" style={{ color: 'var(--ink)' }}>78% confidence</span>, with these citations,
              on this methodology. Confidence intervals beat verdicts.
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {SIGNALS.map(s => <SignalCard key={s.code} s={s} />)}
        </div>
      </div>
    </section>
  )
}

const COMPARE_ROWS = [
  { host: 'apnews.com',      headline: 'Federal Reserve holds rates steady amid mixed inflation signals',  score: 78, framing: 'Neutral',     tone: 'verified' },
  { host: 'reuters.com',     headline: 'Fed leaves rates unchanged as policymakers weigh inflation risks', score: 89, framing: 'Neutral',     tone: 'verified' },
  { host: 'wsj.com',         headline: 'Fed Stands Pat. Wall Street Recalibrates.',                         score: 81, framing: 'Pro-market',  tone: 'verified' },
  { host: 'nytimes.com',     headline: 'A cautious Fed signals the easy money era is over',                 score: 74, framing: 'Skeptical',   tone: 'verified' },
  { host: 'foxbusiness.com', headline: 'Powell holds the line as Trump pressure mounts',                    score: 52, framing: 'Political',   tone: 'mixed' },
  { host: 'breitbart.com',   headline: 'Fed refuses to cut rates, ignoring families struggling with prices',score: 31, framing: 'Adversarial', tone: 'disputed' },
  { host: 'cnbc.com',        headline: 'Markets digest Fed pause; rate-cut odds slide to 24%',              score: 84, framing: 'Pro-market',  tone: 'verified' },
  { host: 'theguardian.com', headline: 'US central bank holds rates as recession warnings grow',            score: 71, framing: 'Skeptical',   tone: 'verified' },
]

export function ComparePreview() {
  return (
    <section id="compare" className="q-anchor" style={{ padding: '24px 0 96px' }}>
      <div className="q-container">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="q-eyebrow" style={{ color: 'var(--ember)' }}>Compare · one story, eight outlets</div>
            <h2 style={{
              fontFamily: 'var(--sans)', fontWeight: 500,
              margin: '12px 0 0', fontSize: 'clamp(30px, 3vw, 44px)',
              color: 'var(--ink)', letterSpacing: '-0.02em',
            }}>How the same story was framed.</h2>
          </div>
          <span className="q-mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            Story · Fed holds rates · Apr 27, 2026
          </span>
        </div>
        <div style={{
          background: 'var(--paper)',
          border: '0.5px solid var(--fog)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '160px 1fr 140px 100px 72px',
            padding: '14px 24px', background: 'var(--mist)',
            borderBottom: '0.5px solid var(--fog)',
            alignItems: 'center', gap: 16,
          }}>
            {['Outlet', 'Headline', 'Framing', 'Score', ''].map(h => (
              <div key={h} className="q-mono" style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{h}</div>
            ))}
          </div>
          {COMPARE_ROWS.map((r, i) => {
            const tone = TONE_HEX[r.tone]
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '160px 1fr 140px 100px 72px',
                padding: '16px 24px',
                borderTop: i === 0 ? 0 : '0.5px solid var(--fog)',
                alignItems: 'center', gap: 16,
              }}>
                <span className="q-mono" style={{ fontSize: 12, color: 'var(--ink)' }}>{r.host}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.3, color: 'var(--ink)' }}>{r.headline}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>{r.framing}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{
                    fontFamily: 'var(--sans)', fontWeight: 500, fontSize: 22,
                    fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: tone,
                  }}>{r.score}</span>
                  <span className="q-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>/100</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: 56, height: 4, borderRadius: 2, background: 'var(--mist)', overflow: 'hidden' }}>
                    <div style={{ width: `${r.score}%`, height: '100%', background: tone, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 22, padding: '18px 22px', border: '0.5px dashed var(--fog)', borderRadius: 10 }}>
          <div className="q-eyebrow">What this view shows</div>
          <p style={{
            margin: '8px 0 0', fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 17, lineHeight: 1.5, color: 'var(--ink)',
          }}>
            The same story, across eight outlets. Source diversity ranges from 2 to 14 unique citations.
            Framing variance is 3.4&times; the topic average. The reporting is largely consistent;
            the language is not.
          </p>
        </div>
      </div>
    </section>
  )
}

export function Methodology() {
  return (
    <section id="method" className="q-anchor" style={{
      background: 'var(--ink)',
      color: 'var(--bone)',
      padding: '120px 0',
      position: 'relative',
    }}>
      <div className="q-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          <div>
            <div className="q-eyebrow" style={{ color: 'var(--ember)' }}>● Methodology</div>
            <h2 style={{
              fontFamily: 'var(--sans)', fontWeight: 500,
              fontSize: 'clamp(40px, 5vw, 68px)',
              margin: '16px 0 0', color: 'var(--bone)',
              letterSpacing: '-0.025em', lineHeight: 1.04,
            }}>
              Show the work<br/>
              <span style={{ color: 'var(--ember)' }}>—</span> every time.
            </h2>
            <p style={{
              marginTop: 28, fontFamily: 'var(--serif)', fontStyle: 'italic',
              fontSize: 22, lineHeight: 1.5, color: '#CFCFC2', maxWidth: '32ch',
            }}>
              If Quanta can’t defend an output, Quanta doesn’t produce it. Every score traces to specific
              sentences, citations, and reasoning. The user can audit us.
            </p>
            <div style={{ marginTop: 36, display: 'grid', gap: 14, maxWidth: 460 }}>
              {[
                ['Calibrated, not categorical', 'Confidence intervals, never verdicts.'],
                ['Article-level, not outlet-level', 'We rate the piece in front of you.'],
                ['Multi-dimensional, not a slider', 'Five signals, one fingerprint.'],
                ['Auditable down to the sentence', 'Click any score to see the language.'],
              ].map(([title, d]) => (
                <div key={title} style={{
                  display: 'grid', gridTemplateColumns: '24px 1fr',
                  gap: 14, alignItems: 'baseline',
                  padding: '14px 0', borderTop: '0.5px solid #1F3D5A',
                }}>
                  <span style={{ color: 'var(--ember)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.04em' }}>→</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 16, color: 'var(--bone)' }}>{title}</div>
                    <div style={{ marginTop: 2, fontSize: 14, color: '#A6B3C4' }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            background: '#142F4A',
            border: '0.5px solid #1F3D5A',
            borderRadius: 14,
            padding: '24px 28px',
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 80px rgba(0,0,0,0.32)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span className="q-mono" style={{ fontSize: 11, color: '#A6B3C4', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Methodology / Framing</span>
              <span className="q-mono" style={{ fontSize: 10, color: 'var(--ember)' }}>v 1.4.0</span>
            </div>
            <h3 style={{
              margin: 0, fontFamily: 'var(--serif)',
              fontWeight: 400, fontSize: 26, color: 'var(--bone)',
              letterSpacing: '-0.01em', lineHeight: 1.25,
            }}>
              &ldquo;The Fed’s decision was widely expected by economists.&rdquo;{' '}
              <span style={{ color: '#A6B3C4', fontStyle: 'italic', fontSize: 18 }}>— attributed once, sourced from an analyst note.</span>
            </h3>
            <div style={{ marginTop: 24, paddingTop: 22, borderTop: '0.5px solid #1F3D5A', display: 'grid', gap: 14 }}>
              {[
                { code: 'F-01', name: 'Voice diversity',     w: 70 },
                { code: 'F-02', name: 'Attribution density', w: 56 },
                { code: 'F-03', name: 'Sentiment loading',   w: 31 },
                { code: 'F-04', name: 'Hedging language',    w: 82 },
              ].map((r) => (
                <div key={r.code} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 40px', gap: 14, alignItems: 'center' }}>
                  <span className="q-mono" style={{ fontSize: 11, color: 'var(--ember)' }}>{r.code}</span>
                  <span style={{ fontSize: 13, color: 'var(--bone)' }}>{r.name}</span>
                  <div style={{ height: 3, background: '#1F3D5A', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${r.w}%`, height: '100%', background: 'var(--ember)' }} />
                  </div>
                  <span className="q-mono" style={{ fontSize: 12, color: 'var(--bone)', textAlign: 'right' }}>{r.w}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 24, padding: '14px 16px',
              background: 'rgba(230,162,60,0.07)',
              border: '0.5px solid rgba(230,162,60,0.4)',
              borderRadius: 8,
            }}>
              <div className="q-mono" style={{ fontSize: 10, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Weighting</div>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: '#CFCFC2', lineHeight: 1.55 }}>
                Framing balance contributes 18% to the overall score. Weights are documented at{' '}
                <span className="q-mono" style={{ color: 'var(--bone)' }}>quanta.news/methodology</span> and updated quarterly with a public changelog.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: 1, background: 'linear-gradient(90deg, transparent, var(--ember), transparent)',
        opacity: 0.6,
      }} />
    </section>
  )
}

export function QuoteStrip() {
  return (
    <section style={{ padding: '96px 0 40px' }}>
      <div className="q-narrow" style={{ textAlign: 'center' }}>
        <div className="q-eyebrow" style={{ color: 'var(--ember)' }}>What it sounds like</div>
        <p style={{
          margin: '20px auto 0',
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(28px, 3vw, 40px)',
          fontWeight: 400, lineHeight: 1.25, letterSpacing: '-0.015em',
          color: 'var(--ink)', maxWidth: '24ch',
        }}>
          &ldquo;78% confidence. Three of five citations led to primary sources.
          The framing leans slightly <span style={{ fontStyle: 'italic' }}>—</span> read another view too.&rdquo;
        </p>
        <div className="q-mono" style={{ marginTop: 22, fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          — Quanta, on a typical Tuesday
        </div>
      </div>
    </section>
  )
}

export function CTAFooter() {
  return (
    <footer id="cta" className="q-anchor" style={{
      background: 'var(--mist)',
      borderTop: '0.5px solid var(--fog)',
      padding: '96px 0 40px',
      marginTop: 40,
    }}>
      <div className="q-container">
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'end',
          paddingBottom: 64, borderBottom: '0.5px solid var(--fog)',
        }}>
          <div>
            <div className="q-eyebrow" style={{ color: 'var(--ember)' }}>● Start reading</div>
            <h2 style={{
              fontFamily: 'var(--sans)', fontWeight: 500,
              fontSize: 'clamp(40px, 5vw, 72px)',
              margin: '16px 0 0', color: 'var(--ink)',
              letterSpacing: '-0.025em', lineHeight: 1.02,
            }}>
              A measurement instrument <span style={{ color: 'var(--ember)' }}>—</span> in your pocket.
            </h2>
            <p style={{
              marginTop: 22, maxWidth: '50ch',
              fontFamily: 'var(--serif)', fontStyle: 'italic',
              fontSize: 20, lineHeight: 1.5, color: 'var(--graphite)',
            }}>
              Install the extension, paste a link, or pipe articles through the API. Three free
              analyses a day, forever. No card required.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
            <a href="#" className="q-btn" style={{ padding: '16px 24px', fontSize: 15 }}>
              Install the browser extension
            </a>
            <a href="#" className="q-btn q-btn--ghost" style={{ padding: '16px 24px', fontSize: 15 }}>
              Open quanta.news →
            </a>
            <div className="q-mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.16em', marginTop: 6 }}>
              Chrome · Safari · Firefox · Edge
            </div>
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr',
          gap: 40, padding: '48px 0 32px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="14" fill="#0F2233"/>
                <circle cx="32" cy="30" r="13" stroke="#F4F1E9" strokeWidth="2.5" fill="none"/>
                <circle cx="44" cy="42" r="3.2" fill="#E6A23C"/>
              </svg>
              <span style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 20, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                Quanta<span className="q-dot">.</span>
              </span>
            </div>
            <p style={{ marginTop: 18, fontSize: 14, color: 'var(--ink-4)', lineHeight: 1.55, maxWidth: '32ch' }}>
              Quanta is the credibility layer for the internet. Independent and ad-free —
              revenue from subscriptions and the API.
            </p>
          </div>
          {([
            ['Product', ['Web app', 'Browser extension', 'Mobile (iOS, Android)', 'API', 'Pricing']],
            ['For',     ['Readers', 'Students & educators', 'Journalists', 'Newsrooms', 'Researchers']],
            ['Open',    ['Methodology', 'Changelog', 'Advisory board', 'Bias audits', 'Research papers']],
            ['Company', ['About', 'Manifesto', 'Press', 'Careers', 'Contact']],
          ] as Array<[string, string[]]>).map(([title, items]) => (
            <div key={title}>
              <div className="q-eyebrow">{title}</div>
              <ul style={{ margin: '14px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                {items.map(it => (
                  <li key={it}><a href="#" style={{ fontSize: 14, color: 'var(--ink)' }}>{it}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 24, borderTop: '0.5px solid var(--fog)',
        }}>
          <span className="q-mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            Quanta · v1.4.0 · © 2026 · Measure. Understand. Elevate.
          </span>
          <span className="q-mono" style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            status: <span style={{ color: '#2E7D5B' }}>● all systems measuring</span>
          </span>
        </div>
      </div>
    </footer>
  )
}
