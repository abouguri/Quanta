'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { getHistory } from '@/lib/history'

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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
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
      className="animate-fadeUp"
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 0, borderBottom: '1px solid var(--ghost)' }}
    >
      <div style={{ padding: '24px 0 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--sans)',
          fontWeight: 400,
          fontSize: 'clamp(40px, 5.2vw, 72px)',
          lineHeight: 1.04,
          letterSpacing: '-0.025em',
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

        <div style={{ display: 'flex', gap: 4, marginTop: 34, marginBottom: 12 }}>
          <TabBtn active={tab === 'url'} onClick={() => setTab('url')}>{t('input.urlTab')}</TabBtn>
          <TabBtn active={tab === 'text'} onClick={() => setTab('text')}>{t('input.textTab')}</TabBtn>
        </div>

        {tab === 'url' ? (
          <div className="field" style={{ display: 'flex', border: '1px solid var(--ink)', background: 'var(--white)', borderRadius: 8, overflow: 'hidden' }}>
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--grey)',
              padding: '0 16px', display: 'flex', alignItems: 'center', borderRight: '1px solid var(--ghost)',
            }}>
              {t('input.urlPrefix')}
            </span>
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder="https://"
              spellCheck={false}
              style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', padding: '18px 16px', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)' }}
            />
            <button onClick={submit} disabled={!ready} style={{ display: 'flex', gap: 2, border: 0, padding: 0, background: 'transparent', cursor: ready ? 'pointer' : 'not-allowed' }}>
              <span style={{ background: ready ? 'var(--ink)' : 'var(--ghost)', color: ready ? 'var(--paper)' : 'var(--grey)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '16px 18px' }}>
                {t('input.submitButton')}
              </span>
              <span style={{ background: ready ? 'var(--ink)' : 'var(--ghost)', color: ready ? 'var(--paper)' : 'var(--grey)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '16px 20px 16px 18px', position: 'relative' }}>
                {t('input.submitButtonNow')}
                <i style={{ position: 'absolute', top: 8, right: 7, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              </span>
            </button>
          </div>
        ) : (
          <div className="field" style={{ border: '1px solid var(--ink)', background: 'var(--white)' }}>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t('input.textPlaceholder')}
              rows={7}
              style={{ width: '100%', border: 0, background: 'transparent', padding: 18, fontSize: 14, fontFamily: 'var(--mono)', color: 'var(--ink)', resize: 'vertical', lineHeight: 1.55 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid var(--ghost)', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--grey)', letterSpacing: '0.1em' }}>
              <span>
                {text.length} {t('input.charactersLabel').toUpperCase()}
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
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '0.18em', marginRight: 4 }}>
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
                style={{ fontFamily: 'var(--mono)', fontSize: 12, background: 'transparent', border: '1px solid var(--ghost)', color: 'var(--ink)', padding: '6px 10px', borderRadius: 2, cursor: 'pointer' }}
              >
                {host}
              </button>
            )
          })}
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--grey)', marginTop: 30, lineHeight: 2 }}>
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
  verified: 'rgba(79,174,131,0.55)',
  contested: 'rgba(216,150,78,0.55)',
  unsupported: 'rgba(224,107,107,0.55)',
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

function SignalField() {
  const { t } = useTranslation()
  const { x, y } = useCursorField()

  const glowX = `${(x * 100).toFixed(2)}%`
  const glowY = `${(y * 100).toFixed(2)}%`
  const fieldFar = `translate3d(${((x - 0.5) * -26).toFixed(1)}px,${((y - 0.5) * -18).toFixed(1)}px,0)`
  const fieldNear = `translate3d(${((x - 0.5) * 34).toFixed(1)}px,${((y - 0.5) * 24).toFixed(1)}px,0)`
  const crosshairX = `translateX(${((x - 0.5) * 260).toFixed(1)}px)`
  const crosshairY = `translateY(${((y - 0.5) * 200).toFixed(1)}px)`
  const fieldReading = String(Math.round(31 + x * 63)).padStart(2, '0')
  const band = x > 0.72 ? 'verified' : x > 0.42 ? 'contested' : 'unsupported'
  const fieldCaption = `sample at ${(x * 100).toFixed(0)}/${(y * 100).toFixed(0)} · ${band} band`

  const [recent, setRecent] = useState<ReturnType<typeof getHistory>>([])
  useEffect(() => { setRecent(getHistory()) }, [])
  const scores = recent.map(r => r.score)
  const median = scores.length ? [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)] : null
  const spread = scores.length ? `${Math.min(...scores)}–${Math.max(...scores)}` : null

  return (
    <div style={{ background: 'var(--deep)', position: 'relative', overflow: 'hidden', padding: '24px 40px 40px', minHeight: 420, cursor: 'crosshair' }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', height: '40%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(230,162,60,0.10) 50%, transparent 100%)',
        animation: 'scanSweep 5s ease-in-out infinite',
      }} />

      <div style={{
        position: 'absolute', width: 520, height: 520, left: glowX, top: glowY, margin: '-260px 0 0 -260px',
        pointerEvents: 'none', background: 'radial-gradient(circle, rgba(230,162,60,0.16) 0%, rgba(230,162,60,0.05) 38%, transparent 68%)',
      }} />

      <div style={{
        position: 'absolute', inset: '-12% -8%', pointerEvents: 'none', transform: fieldFar, willChange: 'transform',
        display: 'flex', flexWrap: 'wrap', gap: '18px 26px', alignContent: 'center', justifyContent: 'center',
      }}>
        {FIELD_WORDS_FAR.map(w => (
          <span key={w} style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(241,238,231,0.09)', whiteSpace: 'nowrap' }}>
            {w}
          </span>
        ))}
      </div>

      <div style={{
        position: 'absolute', inset: '52% -4% -6% -4%', pointerEvents: 'none', transform: fieldNear, willChange: 'transform',
        display: 'flex', flexWrap: 'wrap', gap: '16px 22px', alignContent: 'flex-end', justifyContent: 'center',
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
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7d7b74' }}>
          {t('input.signalPanelTitle')}
        </div>

        <div style={{
          transform: fieldNear, willChange: 'transform', margin: '28px 0', padding: '18px 22px 20px',
          background: 'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.7) 62%, transparent 100%)',
          borderLeft: '1px solid var(--accent)', width: 'fit-content',
        }}>
          <div className="mono" style={{ fontSize: 'clamp(48px,7vw,104px)', lineHeight: 0.92, letterSpacing: '-0.04em', color: 'var(--accent)' }}>
            {fieldReading}
          </div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#a3a19b', marginTop: 12 }}>
            {fieldCaption}
          </div>
        </div>

        <div style={{ paddingTop: 16, borderTop: '1px dashed rgba(255,255,255,0.22)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7d7b74' }}>
          {median !== null
            ? t('input.signalPanelStats', { median, spread: spread ?? '—' })
            : t('input.signalPanelStatsEmpty')}
          {' · '}{t('input.signalPanelHint')}
        </div>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
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
