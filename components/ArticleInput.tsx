'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { getHistory, type AnalysisHistory as HistoryEntry } from '@/lib/history'
import { useAuth } from '@/lib/supabase/auth-context'

const SAMPLE_URLS = [
  { url: 'https://apnews.com/article/election-night-recount-pennsylvania', label: 'AP News — election recount' },
  { url: 'https://infowars.com/breaking-secret-files-exposed-globalist-plot', label: 'InfoWars — alleged exposé' },
  { url: 'https://buzzfeed.com/news/article/24-things-you-wont-believe-mayor-said', label: 'BuzzFeed — listicle headline' },
]

interface ArticleInputProps {
  onSubmit: (url: string | null, text: string) => void
}

export function ArticleInput({ onSubmit }: ArticleInputProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'url' | 'text'>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  // Both panels stay mounted (see the tabpanel markup below) so tab 02's
  // aria-controls always resolves to a real element instead of dangling
  // while tab 01 is active — which means each field needs its own ref;
  // a single shared ref can't attach to two simultaneously-mounted nodes.
  const urlInputRef = useRef<HTMLInputElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const prevTab = useRef(tab)

  // Only steal focus on an explicit tab switch, not on initial mount — auto-
  // focusing on load would skip a keyboard user straight past the skip link
  // and the entire nav to land mid-page. Comparing against the previous tab
  // (rather than a "ran once" flag) keeps this correct under React Strict
  // Mode's double-invoked effects in dev, which would otherwise defeat a
  // simple first-render guard.
  useEffect(() => {
    if (prevTab.current !== tab) {
      (tab === 'url' ? urlInputRef.current : textAreaRef.current)?.focus()
    }
    prevTab.current = tab
  }, [tab])

  const ready = tab === 'url' ? url.trim().length > 6 : text.trim().length > 100

  const submit = () => {
    if (!ready) return
    onSubmit(tab === 'url' ? url.trim() : null, tab === 'text' ? text.trim() : '')
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) submit()
  }

  return (
    <header
      className="animate-fadeUp q-hero"
      style={{ borderBottom: '1px solid var(--ghost)' }}
    >
      <div className="q-hero-copy" style={{ padding: '24px 48px 40px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 600,
          fontSize: 'clamp(40px, 5.2vw, 72px)',
          lineHeight: 1.04,
          letterSpacing: '-0.015em',
          margin: 0,
          color: 'var(--ink)',
        }}>
          {t('input.heroLine1')}<br />{t('input.heroLine2')}
        </h1>
        <p style={{
          fontSize: 'clamp(16px, 1.3vw, 20px)',
          lineHeight: 1.45,
          color: 'var(--grey)',
          maxWidth: '46ch',
          margin: '22px 0 0',
        }}>
          {t('input.heroSubtitle')}
        </p>

        <div
          role="tablist"
          aria-label={t('input.tabsLabel')}
          onKeyDown={e => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
            e.preventDefault()
            const next = tab === 'url' ? 'text' : 'url'
            setTab(next)
            document.getElementById(next === 'url' ? 'tab-url' : 'tab-text')?.focus()
          }}
          style={{ display: 'flex', gap: 4, marginTop: 34, marginBottom: 12 }}
        >
          <TabBtn id="tab-url" controls="panel-url" active={tab === 'url'} onClick={() => setTab('url')}>{t('input.urlTab')}</TabBtn>
          <TabBtn id="tab-text" controls="panel-text" active={tab === 'text'} onClick={() => setTab('text')}>{t('input.textTab')}</TabBtn>
        </div>

        <div id="panel-url" role="tabpanel" aria-labelledby="tab-url" hidden={tab !== 'url'} className="field q-url-row" style={{ display: tab === 'url' ? 'flex' : 'none', flexWrap: 'wrap', border: '1px solid var(--ghost)', background: 'var(--white)', borderRadius: 20, overflow: 'hidden' }}>
          <label htmlFor="article-url" className="q-visually-hidden">{t('input.urlLabel')}</label>
          <span aria-hidden="true" className="q-url-prefix" style={{
            fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--grey)',
            padding: '0 16px', borderRight: '1px solid var(--ghost)',
          }}>
            {t('input.urlPrefix')}
          </span>
          <input
            id="article-url"
            name="url"
            ref={urlInputRef}
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKey}
            placeholder="https://"
            type="url"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="off"
            spellCheck={false}
            style={{ flex: '1 1 auto', minWidth: 260, border: 0, background: 'transparent', padding: '18px 16px', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)' }}
          />
          <button onClick={submit} disabled={!ready} className="q-url-submit" style={{ display: 'flex', flexDirection: 'column', border: 0, padding: 0, background: ready ? 'var(--ink)' : 'var(--ghost)', cursor: ready ? 'pointer' : 'not-allowed' }}>
            <span style={{ color: ready ? 'var(--paper)' : 'var(--grey)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '13px 18px 2px' }}>
              {t('input.submitButton')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: ready ? 'var(--paper)' : 'var(--grey)', opacity: 0.75, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 18px 11px' }}>
              <i style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              {t('input.submitButtonNow')}
            </span>
          </button>
        </div>
        {tab === 'url' && !ready && (
          <div aria-live="polite" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--grey)', letterSpacing: '0.06em', marginTop: 8 }}>
            {t('input.urlHint')}
          </div>
        )}
        <div id="panel-text" role="tabpanel" aria-labelledby="tab-text" hidden={tab !== 'text'} className="field" style={{ border: '1px solid var(--ghost)', background: 'var(--white)' }}>
          <label htmlFor="article-text" className="q-visually-hidden">{t('input.textLabel')}</label>
          <textarea
            id="article-text"
            name="text"
            ref={textAreaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('input.textPlaceholder')}
            rows={7}
            style={{ width: '100%', border: 0, background: 'transparent', padding: 18, fontSize: 14, fontFamily: 'var(--mono)', color: 'var(--ink)', resize: 'vertical', lineHeight: 1.55 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid var(--ghost)', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--grey)', letterSpacing: '0.1em' }}>
            <span aria-live="polite">
              {text.length < 100
                ? t('input.charCountMin', { n: text.length })
                : t('input.charCountReady', { n: text.length })}
              {text.length > 0 && text.length < 100 && (
                <span style={{ color: 'var(--unsupported)', marginLeft: 10 }}>{t('input.charsNeedMore', { n: 100 - text.length })}</span>
              )}
              {text.length >= 100 && <span style={{ color: 'var(--verified)', marginLeft: 10 }}>{t('input.charsReady')}</span>}
            </span>
            <button
              onClick={submit}
              disabled={!ready}
              style={{
                background: ready ? 'var(--ink)' : 'transparent', color: ready ? 'var(--paper)' : 'var(--grey)',
                padding: '10px 22px', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
                cursor: ready ? 'pointer' : 'not-allowed', border: ready ? 0 : '1px solid var(--ghost)',
              }}
            >
              {t('input.submitButton')}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.18em', marginRight: 4 }}>
            {t('input.tryOneOf')}
          </span>
          {SAMPLE_URLS.map(s => {
            let host = ''
            try { host = new URL(s.url).hostname } catch { host = s.url }
            return (
              <button
                key={s.url}
                type="button"
                onClick={() => { setTab('url'); setUrl(s.url) }}
                className="q-tap-target-sm"
                style={{ fontFamily: 'var(--mono)', fontSize: 12, background: 'transparent', border: '1px solid var(--ghost)', color: 'var(--ink)', padding: '6px 10px', borderRadius: 999, cursor: 'pointer' }}
              >
                {host}
              </button>
            )
          })}
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--grey)', marginTop: 30, lineHeight: 2 }}>
          {t('input.statsLine')}<br />
          {t('input.quotaLine')}
          <span style={{ display: 'inline-block', width: 8, height: '1.05em', background: 'currentColor', verticalAlign: -2, marginLeft: 4, animation: 'blink 0.9s steps(1) infinite' }} />
        </div>
      </div>

      <SignalField />
    </header>
  )
}

// ---------------------------------------------------------------------------
// Signal field — a mouse-tracked ambient panel. The word layers and the
// central "reading" are decorative texture (same convention as the wire
// ticker and the sample URLs above), not a claim about any real article; the
// footer line is the one spot that reads as a specific metric, so it grounds
// itself in this browser's actual local history instead of a made-up number.
// ---------------------------------------------------------------------------

const FIELD_WORDS_FAR = [
  'claim 0412', 'no attribution', 'circular citation', 'byline missing', 'press release',
  'correction logged', 'primary source', 'paywalled', 'caps ratio 3.1', 'excl density 0.4',
  'archive hit', 'unnamed officials', 'study without link', 'image reused', 'headline mismatch',
  'wire copy', 'op-ed', 'analyst note', 'regulatory filing', 'peer reviewed',
  'db miss', 'db hit', 'stance shift', 'hedged claim', 'quote fragment',
  'recency unknown', 'tld flagged', 'frame 06', 'frame 07', 'sse open',
  'retry 429', 'fallback brave', 'model labelled', 'unverified', 'low confidence',
]

const FIELD_WORDS_NEAR: Array<[string, 'verified' | 'contested' | 'unsupported']> = [
  ['theguardian.com 91', 'verified'], ['reuters.com 94', 'verified'], ['theatlantic.com 64', 'contested'],
  ['apnews.com 78', 'verified'], ['breitbart.com 31', 'unsupported'], ['wsj.com 81', 'verified'],
  ['nytimes.com 74', 'verified'], ['infowars.com 22', 'unsupported'], ['cnbc.com 84', 'verified'],
  ['foxbusiness.com 52', 'contested'], ['buzzfeed.com 48', 'contested'], ['ft.com 88', 'verified'],
]

const FIELD_WORD_TONE: Record<(typeof FIELD_WORDS_NEAR)[number][1], string> = {
  verified: 'var(--verified-on-deep)',
  contested: 'var(--mixed-on-deep)',
  unsupported: 'var(--disputed-on-deep)',
}

/** Lerps toward the cursor position (as viewport fractions), idle at center until the pointer moves. */
function useCursorField() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = { x: 0.5, y: 0.5 }
    const cur = { x: 0.5, y: 0.5 }

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX / window.innerWidth
      target.y = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)

    let raf = 0
    const tick = () => {
      const k = reduceMotion ? 1 : 0.075
      cur.x += (target.x - cur.x) * k
      cur.y += (target.y - cur.y) * k
      setPos(prev =>
        Math.abs(cur.x - prev.x) > 0.0015 || Math.abs(cur.y - prev.y) > 0.0015
          ? { x: cur.x, y: cur.y }
          : prev
      )
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return pos
}

const WORMHOLE_RINGS = [
  { r: 132, w: 10, op: 0.30 },
  { r: 88, w: 8, op: 0.20 },
  { r: 52, w: 6, op: 0.14 },
]

/** Concentric Q-shaped rings (circle + comma tail) spinning slowly behind the confidence reading — evidence resolving into a number. */
function QWormhole() {
  return (
    <div
      className="q-wormhole"
      aria-hidden="true"
      style={{
        position: 'absolute', left: '50%', top: '50%', width: 0, height: 0,
        animation: 'wormholeSpin 70s linear infinite', pointerEvents: 'none',
      }}
    >
      {WORMHOLE_RINGS.map((ring, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: -ring.r, top: -ring.r, width: ring.r * 2, height: ring.r * 2,
            borderRadius: '50%', border: `${ring.w}px solid var(--accent)`, opacity: ring.op,
          }}
        >
          <span style={{
            position: 'absolute', width: ring.r * 0.42, height: ring.r * 0.16, background: 'var(--accent)',
            borderRadius: 999, right: -ring.r * 0.24, bottom: ring.r * 0.08, transform: 'rotate(44deg)',
          }} />
        </div>
      ))}
    </div>
  )
}

function SignalField() {
  const { t } = useTranslation()
  const { x, y } = useCursorField()

  const glowX = `${(x * 100).toFixed(2)}%`
  const glowY = `${(y * 100).toFixed(2)}%`
  const fieldFar = `translate3d(${((x - 0.5) * -26).toFixed(1)}px,${((y - 0.5) * -18).toFixed(1)}px,0)`
  const fieldNear = `translate3d(${((x - 0.5) * 34).toFixed(1)}px,${((y - 0.5) * 24).toFixed(1)}px,0)`
  const crosshairX = `translateX(${((x - 0.5) * 260).toFixed(1)}px)`
  const crosshairY = `translateY(${((y - 0.5) * 200).toFixed(1)}px)`
  // Sub-scores, not raw cursor coordinates — the page states its scoring
  // formula (structural × 0.3 + claims × 0.7) two sections down, and a
  // reader who checks this demo's own numbers against it should find they
  // reconcile rather than land on a pair of unlabelled field coordinates.
  const structuralSample = Math.round(20 + x * 80)
  const claimsSample = Math.round(20 + y * 80)
  const fieldReading = String(Math.round(structuralSample * 0.3 + claimsSample * 0.7)).padStart(2, '0')
  const band = Number(fieldReading) >= 75 ? 'verified' : Number(fieldReading) >= 45 ? 'contested' : 'unsupported'
  const fieldCaption = `structural ${structuralSample} · claims ${claimsSample} · ${band} band`

  const { user } = useAuth()
  const [recent, setRecent] = useState<HistoryEntry[]>([])
  useEffect(() => { getHistory().then(setRecent) }, [user?.id])
  const scores = recent.map(r => r.score)
  const median = scores.length >= 3 ? [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)] : null
  const spread = scores.length >= 3 ? `${Math.min(...scores)}–${Math.max(...scores)}` : null
  const statsText =
    scores.length === 0 ? t('input.signalPanelStatsEmpty')
    : scores.length === 1 ? t('input.signalPanelStatsOne', { score: scores[0] })
    : scores.length === 2 ? t('input.signalPanelStatsFew', { n: scores.length, list: scores.join(', ') })
    : t('input.signalPanelStats', { median: median ?? '—', spread: spread ?? '—' })

  return (
    <div style={{
      background: 'var(--deep)',
      position: 'relative', overflow: 'hidden', padding: '24px 40px 40px', minHeight: 420, cursor: 'crosshair',
      borderRadius: 26, margin: '0 0 -1px',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', height: '40%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(240,215,255,0.12) 50%, transparent 100%)',
        animation: 'scanSweep 5s ease-in-out infinite',
      }} />

      <div style={{
        position: 'absolute', width: 520, height: 520, left: glowX, top: glowY, margin: '-260px 0 0 -260px',
        pointerEvents: 'none', background: 'radial-gradient(circle, rgba(240,215,255,0.20) 0%, rgba(240,215,255,0.06) 38%, transparent 68%)',
      }} />

      <div aria-hidden="true" style={{
        position: 'absolute', inset: '-4% 3%', pointerEvents: 'none', transform: fieldFar, willChange: 'transform',
        display: 'flex', flexWrap: 'wrap', gap: '18px 26px', alignContent: 'center', justifyContent: 'center',
      }}>
        {FIELD_WORDS_FAR.map(w => (
          <span key={w} style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(241,238,231,0.09)', whiteSpace: 'nowrap' }}>
            {w}
          </span>
        ))}
      </div>

      {/* stops short of the bottom (56px) so the corpus stats/hint line below always has its own clear row instead of the field bleeding into it */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: '52% 3% 56px 3%', pointerEvents: 'none', transform: fieldNear, willChange: 'transform',
        display: 'flex', flexWrap: 'wrap', gap: '16px 22px', alignContent: 'flex-end', justifyContent: 'center', overflow: 'hidden',
      }}>
        {FIELD_WORDS_NEAR.map(([w, tone]) => (
          <span key={w} style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: FIELD_WORD_TONE[tone], whiteSpace: 'nowrap' }}>
            {w}
          </span>
        ))}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(241,238,231,0.28), transparent)', transform: crosshairY, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'linear-gradient(180deg, transparent, rgba(241,238,231,0.28), transparent)', transform: crosshairX, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 420 }}>
        <div className="mono" style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--on-deep-3)' }}>
          {t('input.signalPanelTitle')}
        </div>

        <div style={{
          position: 'relative',
          transform: fieldNear, willChange: 'transform', margin: '28px 0', padding: '18px 22px 20px',
          background: 'rgba(2,31,27,0.88)', borderRadius: 16,
          border: '1px solid var(--accent)', width: 'fit-content',
        }}>
          <QWormhole />
          <div className="mono" style={{ position: 'relative', fontSize: 'clamp(48px,7vw,104px)', lineHeight: 0.92, letterSpacing: '-0.04em', color: 'var(--accent)' }}>
            {fieldReading}
          </div>
          <div className="mono" style={{ position: 'relative', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--on-deep-2)', marginTop: 12 }}>
            {fieldCaption}
          </div>
        </div>

        {/* Opaque background, not just the near-field layer's own bottom
            inset — a wrapped 2–3 line stats string (long locale strings,
            narrow viewports) can extend taller than that inset reserves,
            and with no fill here the corpus words behind it would show
            through and collide with this text. */}
        <div style={{ position: 'relative', zIndex: 1, background: 'var(--deep)', paddingTop: 16, borderTop: '1px dashed rgba(255,255,255,0.22)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--on-deep-3)' }}>
          {statsText}
          {' · '}{t('input.signalPanelHint')}
        </div>
      </div>
    </div>
  )
}

function TabBtn({ id, controls, active, onClick, children }: { id: string; controls: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      style={{
        padding: '8px 14px 9px',
        fontFamily: 'var(--mono)',
        fontSize: 12,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--paper)' : 'var(--ink-2)',
        border: active ? '1px solid var(--ink)' : '1px solid var(--ghost)',
      }}
    >
      {children}
    </button>
  )
}
