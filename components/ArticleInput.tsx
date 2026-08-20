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

function scoreBand(score: number): { verdict: string; tone: string } {
  if (score >= 80) return { verdict: 'verified', tone: 'var(--verified)' }
  if (score >= 60) return { verdict: 'mixed', tone: 'var(--contested)' }
  if (score >= 40) return { verdict: 'mixed', tone: 'var(--contested)' }
  return { verdict: 'false', tone: 'var(--unsupported)' }
}

export function ArticleInput({ onSubmit }: ArticleInputProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'url' | 'text'>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Real local history, not a demo feed — the "recent passes" panel only
  // shows what this browser has actually measured.
  const [recent, setRecent] = useState<ReturnType<typeof getHistory>>([])
  useEffect(() => { setRecent(getHistory().slice(0, 12)) }, [])

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

  const scores = recent.map(r => r.score)
  const median = scores.length ? [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)] : null
  const spread = scores.length ? `${Math.min(...scores)}–${Math.max(...scores)}` : null

  return (
    <header
      className="animate-fadeUp"
      style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 0, borderBottom: '1px solid var(--ghost)' }}
    >
      <div style={{ padding: '24px 0 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: 22 }}>
          <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
            <i style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)', animation: 'statusPing 1.8s cubic-bezier(0,0,.2,1) infinite' }} />
            <i style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)' }} />
          </span>
          <span>{t('input.instrumentBadge')}</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--sans)',
          fontWeight: 400,
          fontSize: 'clamp(40px, 5.2vw, 72px)',
          lineHeight: 1.04,
          letterSpacing: '-0.025em',
          margin: 0,
          color: 'var(--ink)',
        }}>
          {t('input.heroLine1')}<br />{t('input.heroLine2')}<br />{t('input.heroLine3')}<span style={{ color: 'var(--accent)' }}>.</span>
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

      <div style={{ background: 'var(--deep)', position: 'relative', overflow: 'hidden', padding: '24px 40px 40px', minHeight: 420 }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', height: '40%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(230,162,60,0.10) 50%, transparent 100%)',
          animation: 'scanSweep 5s ease-in-out infinite',
        }} />
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#7d7b74', marginBottom: 18 }}>
          {t('input.signalPanelTitle')}
        </div>

        {recent.length === 0 ? (
          <div className="mono" style={{ fontSize: 12, letterSpacing: '0.06em', color: '#7d7b74', lineHeight: 1.8 }}>
            {t('input.signalPanelEmpty')}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 7 }}>
            {recent.map((r, i) => {
              const band = scoreBand(r.score)
              let host = r.result.metadata.source || ''
              if (!host && r.url) { try { host = new URL(r.url).hostname } catch { host = r.url } }
              return (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '52px minmax(110px,1fr) 84px 44px', gap: 12, alignItems: 'center', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em', color: i < 4 ? '#e6e4de' : i < 8 ? '#a3a19b' : '#7d7b74' }}>
                  <span>{String(r.date).slice(-4)}</span>
                  <span style={{ textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{host || '—'}</span>
                  <span style={{ color: band.tone, textTransform: 'uppercase' }}>{band.verdict}</span>
                  <span style={{ textAlign: 'right', color: band.tone }}>{r.score}</span>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 26, paddingTop: 16, borderTop: '1px dashed rgba(255,255,255,0.22)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7d7b74' }}>
          {median !== null
            ? t('input.signalPanelStats', { median, spread: spread ?? '—' })
            : t('input.signalPanelStatsEmpty')}
        </div>
      </div>
    </header>
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
