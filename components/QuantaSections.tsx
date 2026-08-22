'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/lib/supabase/auth-context'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSelector } from '@/components/LanguageSelector'

// ---------------------------------------------------------------------------
// Nav — the fixed dark instrument panel, home logo, section links, a live
// wire ticker built from real recent history, and the extension CTA.
// ---------------------------------------------------------------------------

const WIRE: string[] = [
  'structural checks · zero model calls',
  'claims verified against Google Fact Check Tools first',
  'no match → Brave Search over known fact-check domains',
  'still no match → model, labelled, uncertainty-first',
  '10 passes / 24h per IP · no account',
]

export function QuantaNav({ onHome, onOpenHistory }: { onHome: () => void; onOpenHistory: () => void }) {
  const { t } = useTranslation()
  const links: Array<[string, string]> = [
    [t('nav.cost'), '#cost'],
    [t('nav.signals'), '#signals'],
    [t('nav.inspector'), '#inspector'],
    [t('nav.method'), '#method'],
  ]
  const wire = [...WIRE, ...WIRE]

  return (
    <div style={{
      position: 'sticky',
      top: 14,
      zIndex: 50,
      margin: '0 auto',
      maxWidth: 'calc(100vw - 28px)',
      background: 'var(--deep)',
      color: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 0 0 2px var(--bone), 0 4px 14px rgba(0,0,0,0.16)',
      width: 'fit-content',
    }}>
      <nav style={{ display: 'flex', gap: 2, padding: '6px 8px', alignItems: 'center' }}>
        <button onClick={onHome} title="Quanta" aria-label="Quanta — home" style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 0, cursor: 'pointer', padding: '5px 8px 5px 6px' }}>
          <svg width="20" height="20" viewBox="0 0 320 320" fill="none" aria-hidden="true">
            <defs>
              <filter id="fluffNav" x="-30%" y="-30%" width="160%" height="160%">
                <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="8" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
              </filter>
            </defs>
            <circle cx="145" cy="142" r="92" fill="none" stroke="#FFFFEB" strokeWidth="50" filter="url(#fluffNav)" />
            <path d="M176 177 C196 198 218 223 250 248" fill="none" stroke="#FFFFEB" strokeWidth="50" strokeLinecap="round" filter="url(#fluffNav)" />
          </svg>
          <span style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.05em', color: '#FFFFEB', marginLeft: 7 }}>Quanta</span>
        </button>
        {links.map(([label, href]) => (
          <a key={label} href={href} className="mono" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 7px', borderRadius: 12, color: '#FFFFEB', opacity: 0.72 }}>
            {label}
          </a>
        ))}
        <button
          onClick={onOpenHistory}
          title={t('nav.history')}
          aria-label={t('nav.history')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 12, color: '#FFFFEB', opacity: 0.72, background: 'transparent', border: 0, cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="10" cy="10" r="7.5" />
            <path d="M10 6v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 2 }}>
          <LanguageSelector />
          <ThemeToggle />
        </div>
        <AccountMenu />
        <a href="#access" className="mono" style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 9px', borderRadius: 12, border: 0, cursor: 'pointer', background: 'var(--accent)', color: '#000', marginLeft: 4, whiteSpace: 'nowrap' }}>
          {t('nav.installExtensionShort')}
        </a>
      </nav>
      {/* position:relative/absolute, not overflow:hidden alone -- an in-flow
          marquee this wide would otherwise inflate the pill's own
          fit-content width and leave the compact nav row sitting
          left-aligned inside a bar sized for the ticker instead of it. */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.06)', position: 'relative', height: 21, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', width: 'max-content', animation: 'ticker 26s linear infinite' }}>
          {wire.map((w, i) => (
            <span key={i} className="mono" style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 18px', color: '#cbcbcb', whiteSpace: 'nowrap' }}>
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Signed-out: a plain sign-in link. Signed-in: an initial that opens a small menu with account + sign-out. */
function AccountMenu() {
  const { t } = useTranslation()
  const { user, profile, loading } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) return <div style={{ width: 26, height: 26 }} />

  if (!user) {
    return (
      <a
        href="/auth/sign-in"
        className="mono"
        style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '5px 7px', borderRadius: 12, color: '#FFFFEB', opacity: 0.72 }}
      >
        {t('nav.signIn')}
      </a>
    )
  }

  const initial = (profile?.email ?? user.email ?? '?').charAt(0).toUpperCase()

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={profile?.email ?? user.email ?? undefined}
        style={{
          width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.14)', color: '#FFFFEB', border: 0, cursor: 'pointer',
          fontFamily: 'var(--mono)', fontSize: 11,
        }}
      >
        {initial}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div style={{
            position: 'absolute', top: 32, right: 0, zIndex: 61, minWidth: 180,
            background: 'var(--deep)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.32)', overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.14)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: '#a3a19b', wordBreak: 'break-all' }}>
              {profile?.email ?? user.email}
            </div>
            <a
              href="/account"
              className="mono"
              style={{ display: 'block', padding: '10px 14px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFEB' }}
            >
              {t('nav.account')}
            </a>
            {profile?.tier !== 'paid' && (
              <a
                href="/account"
                className="mono"
                style={{ display: 'block', padding: '10px 14px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent)' }}
              >
                {t('nav.upgrade')}
              </a>
            )}
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="mono"
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FFFFEB', background: 'transparent', border: 0, cursor: 'pointer' }}
              >
                {t('nav.signOut')}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 001 · Cost of reading blind — deterministic structural checks, free tier
// ---------------------------------------------------------------------------

const INVENTORY: Array<[string, string, string]> = [
  ['001', 'No byline or author credit', 'high'],
  ['002', 'No machine-readable publish date', 'medium'],
  ['003', 'ALL-CAPS well above normal prose', 'high'],
  ['004', 'Exclamation marks well above normal prose', 'medium'],
  ['005', 'Domain uses a TLD common to low-credibility sites', 'high'],
  ['006', 'Article too short to carry real context', 'medium'],
]

export function CostSection() {
  return (
    <section id="cost" className="q-anchor" style={{ padding: '96px 0' }}>
      <div className="q-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
        <div style={{ background: 'var(--deep)', borderRadius: 26, padding: '30px 32px 26px', boxShadow: '0 18px 60px rgba(3,79,70,.14)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7d7b74', paddingBottom: 14, borderBottom: '1px dashed rgba(255,255,255,0.22)' }}>
            <span>structural checks</span><span>severity</span>
          </div>
          {INVENTORY.map(([num, label, sev]) => (
            <div key={num} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 74px', gap: 14, alignItems: 'baseline', padding: '11px 0', borderBottom: '1px dashed rgba(255,255,255,0.16)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.04em', color: '#e6e4de' }}>
              <span style={{ color: '#7d7b74' }}>{num}</span>
              <span>{label}</span>
              <span style={{ textAlign: 'right', color: sev === 'high' ? 'var(--unsupported)' : 'var(--contested)', textTransform: 'uppercase' }}>{sev}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff' }}>
            <span>free tier</span><span style={{ color: 'var(--accent)' }}>zero model calls</span>
          </div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: 18 }}>
            / the cost of reading blind
          </div>
          <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 'clamp(30px,3.2vw,46px)', lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 20px', maxWidth: '22ch', color: 'var(--ink)' }}>
            Most of what fails an article is countable.
          </h2>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--grey)', maxWidth: '52ch', margin: '0 0 14px' }}>
            Every item on the left is a deterministic check — byline, date, caps ratio, exclamation density, TLD reputation. No model, no variance, no API cost. That pass alone is the free tier.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--grey)', maxWidth: '52ch', margin: 0 }}>
            The claims pass is where a model appears, and it is labelled every time it does: a verdict that came from a fact-check database says so, and one that came from the model says that instead.
          </p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 002 · What the instrument reads — the real pass list
// ---------------------------------------------------------------------------

const CAPABILITIES: Array<[string, string, string]> = [
  ['001', 'Structural signals', 'Byline, date, caps ratio, exclamation density, TLD reputation — no model involved.'],
  ['002', 'Claim extraction', '3–5 checkable statements isolated from opinion and framing.'],
  ['003', 'Fact-check lookup', 'Google Fact Check Tools first — real ratings from PolitiFact, Snopes, FactCheck.org, Full Fact.'],
  ['004', 'Search fallback', 'No database hit → Brave Search restricted to known fact-check domains.'],
  ['005', 'Model fallback', 'Still no match → the model assesses the claim, instructed to say UNVERIFIED over a guess.'],
  ['006', 'Provenance labelling', 'Database, search or model — recorded on every verdict, shown on every card.'],
  ['007', 'Confidence levels', 'High, medium or low — never a false sense of certainty on a thin source.'],
  ['008', 'Weighted scoring', 'Structural × 0.3 + claims × 0.7 — reproducible by hand from the numbers on the report.'],
  ['009', 'Live streaming', 'Every pass streams over SSE as it completes — nothing waits behind a spinner.'],
]

export function SignalsSection() {
  return (
    <section id="signals" className="q-anchor" style={{ background: 'var(--deep)', color: 'var(--paper)', padding: '96px 0', borderRadius: 36, margin: '0 14px' }}>
      <div className="q-container" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 120 }}>
          <div className="mono" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7d7b74', marginBottom: 18 }}>
            / what the instrument reads
          </div>
          <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 'clamp(30px,3.2vw,46px)', lineHeight: 1.08, letterSpacing: '-0.02em', margin: 0 }}>
            Two passes.<br />One number.<br />All of it auditable.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(255,255,255,0.14)' }}>
          {CAPABILITIES.map(([num, name, detail]) => (
            <div key={num} style={{ background: 'var(--deep)', padding: '26px 22px 30px' }}>
              <div className="mono" style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{name}</div>
              <p style={{ margin: '10px 0 0', fontSize: 14, lineHeight: 1.5, color: '#a3a19b' }}>{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 003 · Evidence inspector — a worked demo of one real report's claim ledger
// ---------------------------------------------------------------------------

const DEMO_CLAIMS = [
  {
    verdict: 'VERIFIED', tone: 'var(--verified)',
    short: 'Rate held at 4.25–4.5%',
    text: 'The central bank left its benchmark rate unchanged at 4.25–4.5% for a fourth consecutive meeting.',
    summary: 'Matches the published policy statement from the same day; the range is unchanged from the prior meeting.',
    publisher: 'fact-check db · rated "correct"',
    provenance: 'fact-check database',
    confidence: 'high confidence',
  },
  {
    verdict: 'MIXED', tone: 'var(--contested)',
    short: 'Every forecaster warning',
    text: 'Recession warnings have grown louder across every major forecasting house this quarter.',
    summary: 'Several forecasters raised recession odds; at least two of the largest lowered theirs. "Every" overstates the picture.',
    publisher: 'no fact-check found · web search',
    provenance: 'web search',
    confidence: 'medium confidence',
  },
  {
    verdict: 'UNVERIFIED', tone: 'var(--unknown)',
    short: 'Cut before end of summer',
    text: 'Officials privately expect a first rate cut before the end of the summer.',
    summary: 'No independent source found. Single-sourced to unnamed officials — this assessment is the model’s, not a fact-checker’s.',
    publisher: 'ai assessment · not a verdict',
    provenance: 'llm assessment',
    confidence: 'low confidence',
  },
]

export function InspectorSection() {
  const [selected, setSelected] = useState(0)
  const sel = DEMO_CLAIMS[selected]

  return (
    <section id="inspector" className="q-anchor" style={{ padding: '96px 0' }}>
      <div className="q-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: 20, marginBottom: 26 }}>
          <div>
            <div className="mono" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: 16 }}>
              / evidence inspector
            </div>
            <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 'clamp(30px,3.2vw,46px)', lineHeight: 1.08, letterSpacing: '-0.02em', margin: 0, maxWidth: '24ch', color: 'var(--ink)' }}>
              Click a claim. Watch where it came from.
            </h2>
          </div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--grey)' }}>
            worked example · not a live analysis
          </div>
        </div>

        <div style={{ border: '1px solid var(--ghost)', borderRadius: 26, overflow: 'hidden', background: 'var(--white)', boxShadow: '0 18px 60px rgba(3,79,70,.10)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '240px minmax(0,1fr) 300px', minHeight: 360 }}>
            <div style={{ borderRight: '1px solid var(--ghost)', background: 'var(--bone)' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)', padding: '12px 16px', borderBottom: '1px solid var(--ghost)' }}>
                claim tree
              </div>
              {DEMO_CLAIMS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'grid', gridTemplateColumns: '16px 1fr', gap: 10,
                    alignItems: 'start', padding: '12px 16px', border: 0, borderBottom: '1px solid var(--ghost)',
                    cursor: 'pointer', background: i === selected ? 'var(--white)' : 'transparent',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.tone, marginTop: 5 }} />
                  <span>
                    <span className="mono" style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)' }}>
                      claim {i + 1} · {c.verdict}
                    </span>
                    <span style={{ display: 'block', fontSize: 13, lineHeight: 1.35, color: 'var(--ink)', marginTop: 4 }}>{c.short}</span>
                  </span>
                </button>
              ))}
            </div>

            <div style={{ padding: '22px 26px', borderRight: '1px solid var(--ghost)' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: 14 }}>
                article · selected claim highlighted
              </div>
              <p style={{ fontSize: 17, lineHeight: 1.62, margin: '0 0 14px', color: 'var(--ink)' }}>
                {sel.text}
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.62, margin: 0, color: 'var(--grey)' }}>
                {sel.summary}
              </p>
            </div>

            <div style={{ background: 'var(--bone)' }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)', padding: '12px 16px', borderBottom: '1px solid var(--ghost)' }}>
                provenance
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ border: '1px solid var(--ghost)', background: 'var(--white)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: sel.tone }}>
                    <span>{sel.verdict}</span><span>{sel.confidence}</span>
                  </div>
                  <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--grey)' }}>
                    {sel.provenance}
                  </div>
                  <div style={{ marginTop: 6, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: sel.tone }}>
                    {sel.publisher}
                  </div>
                </div>
                <div style={{ marginTop: 14, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--grey)', lineHeight: 1.9 }}>
                  Lookup order<br />
                  01 google fact check tools<br />
                  02 brave search · known domains<br />
                  03 model · labelled, uncertainty-first
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 20px', background: 'var(--ink)', color: 'var(--bone)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            <span>engine v2 · gpt-oss-120b · groq</span>
            <span>{DEMO_CLAIMS.length} claims shown</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 004 · Method & limits — FAQ
// ---------------------------------------------------------------------------

const FAQ: Array<[string, string, string]> = [
  ['Q.001', 'What can Quanta be wrong about?', 'The 30/70 weighting is reasoned, not fitted to a labelled evaluation set — the number is a comparison tool, not an authority. Scraping also fails on paywalls, heavy JS and bot protection; a failed read is reported as a failed read, never scored anyway.'],
  ['Q.002', 'Where does a verdict actually come from?', 'Claims are checked against the Google Fact Check Tools API first — real ratings from PolitiFact, Snopes, FactCheck.org, Full Fact. Only if that misses does Brave Search run over known fact-check domains, and only if both miss does the model assess the claim — the card always says which one answered.'],
  ['Q.003', 'Why is the structural score only 30%?', 'A well-formatted lie should not outscore a scruffy truth. Structure is cheap to fake and cheap to measure; the claims themselves carry more weight because they are what the article is actually asserting.'],
  ['Q.004', 'What happens when a service is missing a key?', 'The chain degrades instead of breaking: no fact-check key falls through to search, no search key falls through to the model. Missing keys reduce the depth of the analysis, and the provenance field on every claim records which rung answered.'],
  ['Q.005', 'Does the model ever guess?', 'It is instructed to answer UNVERIFIED with low confidence rather than invent a verdict, and forbidden from fabricating citations. A claim whose assessment cannot be parsed also degrades to UNVERIFIED rather than failing the whole report.'],
  ['Q.006', 'What does Quanta never do?', 'It never rates an outlet in place of the piece in front of you, never returns a number without the structural flags and claims that produced it, and never claims to be an oracle. Read the report, not just the score.'],
]

export function MethodSection() {
  const [open, setOpen] = useState(0)
  return (
    <section id="method" className="q-anchor" style={{ background: 'var(--deep)', color: 'var(--paper)', padding: '96px 0', borderRadius: 36, margin: '0 14px' }}>
      <div className="q-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 64, alignItems: 'start' }}>
        <div>
          <div className="mono" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7d7b74', marginBottom: 18 }}>
            / method &amp; limits
          </div>
          <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 'clamp(30px,3.2vw,46px)', lineHeight: 1.08, letterSpacing: '-0.02em', margin: '0 0 20px' }}>
            What this can be wrong about.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: '#a3a19b', maxWidth: '36ch', margin: 0 }}>
            A credibility instrument that hides its limits is just another confident voice. These are ours, in plain words.
          </p>
        </div>
        <div>
          {FAQ.map(([num, question, answer], i) => (
            <div key={num} style={{ borderBottom: '1px dashed rgba(255,255,255,0.22)' }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: '20px 0', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', color: 'var(--paper)' }}
              >
                <span className="mono" style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  <span style={{ color: 'var(--accent)', marginRight: 14 }}>{num}</span>{question}
                </span>
                <span className="mono" style={{ fontSize: 16, color: 'var(--accent)' }}>{open === i ? '−' : '+'}</span>
              </button>
              <div style={{ display: 'grid', gridTemplateRows: open === i ? '1fr' : '0fr', transition: 'grid-template-rows 200ms cubic-bezier(0,0,.2,1)' }}>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: '0 0 22px', fontSize: 16, lineHeight: 1.6, color: '#a3a19b', maxWidth: '70ch' }}>{answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 005 · Access — install CTA, matching the real quota and platform support
// ---------------------------------------------------------------------------

export function AccessSection() {
  return (
    <section id="access" className="q-anchor" style={{ padding: '80px 0 64px' }}>
      <div className="q-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 40, flexWrap: 'wrap' }}>
        <div>
          <div className="mono" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: 18 }}>
            / access
          </div>
          <h2 style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 'clamp(34px,4.4vw,64px)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: 0, maxWidth: '20ch', color: 'var(--ink)' }}>
            Three passes a day. No account.
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <a href="https://chrome.google.com/webstore" target="_blank" rel="noreferrer" style={{ display: 'flex', gap: 2, textDecoration: 'none' }}>
            <span style={{ background: 'var(--ink)', color: 'var(--bone)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '16px 20px', borderRadius: '999px 0 0 999px' }}>
              Install
            </span>
            <span style={{ background: 'var(--ink)', color: 'var(--bone)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '16px 20px', borderRadius: '0 999px 999px 0' }}>
              Extension
            </span>
          </a>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)' }}>
            chrome mv3 · readability · sse
          </span>
        </div>
      </div>
      <div className="q-container" style={{ marginTop: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--ghost)', paddingTop: 22, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)' }}>
        <span>Quanta · engine v2</span>
        <span>Truth, measured</span>
      </div>
    </section>
  )
}
