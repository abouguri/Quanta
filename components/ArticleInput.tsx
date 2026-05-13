'use client'

import { useState, useRef, useEffect } from 'react'

const SAMPLE_URLS = [
  { url: 'https://apnews.com/article/election-night-recount-pennsylvania', label: 'AP News — election recount' },
  { url: 'https://infowars.com/breaking-secret-files-exposed-globalist-plot', label: 'InfoWars — alleged exposé' },
  { url: 'https://buzzfeed.com/news/article/24-things-you-wont-believe-mayor-said', label: 'BuzzFeed — listicle headline' },
]

interface ArticleInputProps {
  onSubmit: (url: string | null, text: string) => void
}

export function ArticleInput({ onSubmit }: ArticleInputProps) {
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
    <section className="animate-fadeUp" style={{ display: 'grid', gap: 36, paddingTop: 8 }}>
      {/* Lede */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 3fr)', gap: 48, alignItems: 'end' }}>
        <div>
          <p className="smcap" style={{ color: 'var(--vermillion)', margin: 0 }}>Today&apos;s Brief — No. 0427</p>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(40px, 5.2vw, 72px)',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            margin: '10px 0 0',
          }}>
            Paste a story.<br />
            We will read it{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--vermillion)' }}>line by line</span>,{' '}
            <span style={{ fontStyle: 'italic' }}>then tell you</span> what we found.
          </h2>
        </div>
        <aside style={{ borderLeft: '1px solid var(--paper-rule)', paddingLeft: 20, color: 'var(--ink-2)' }}>
          <p className="smcap" style={{ margin: 0, color: 'var(--ink-3)' }}>The four passes</p>
          <ol style={{
            margin: '12px 0 0',
            padding: 0,
            listStyle: 'none',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            lineHeight: 1.9,
            color: 'var(--ink-2)',
          }}>
            <li><span style={{ color: 'var(--ink-4)', marginRight: 8 }}>01</span>FACT RISK</li>
            <li><span style={{ color: 'var(--ink-4)', marginRight: 8 }}>02</span>BIAS &amp; FRAMING</li>
            <li><span style={{ color: 'var(--ink-4)', marginRight: 8 }}>03</span>SENSATIONALISM</li>
            <li><span style={{ color: 'var(--ink-4)', marginRight: 8 }}>04</span>RED FLAGS</li>
          </ol>
        </aside>
      </div>

      {/* Tabbed input */}
      <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <TabBtn active={tab === 'url'} onClick={() => setTab('url')}>01 · By URL</TabBtn>
            <TabBtn active={tab === 'text'} onClick={() => setTab('text')}>02 · By Pasted Text</TabBtn>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>
            ENTER ↵ TO ANALYZE
          </div>
        </div>

        {tab === 'url' ? (
          <div className="field" style={{ border: '1px solid var(--ink)', display: 'flex', alignItems: 'stretch', background: 'var(--paper)' }}>
            <span className="mono" style={{
              padding: '18px 16px',
              fontSize: 12,
              color: 'var(--ink-3)',
              borderRight: '1px solid var(--paper-rule)',
              alignSelf: 'center',
              letterSpacing: '0.1em',
            }}>URL ›</span>
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder="https://example.com/article-headline-goes-here"
              spellCheck={false}
              style={{
                flex: 1,
                border: 0,
                background: 'transparent',
                padding: '18px 16px',
                fontSize: 17,
                fontFamily: 'var(--mono)',
                color: 'var(--ink)',
                minWidth: 0,
              }}
            />
            <button
              onClick={submit}
              disabled={!ready}
              style={{
                background: ready ? 'var(--ink)' : 'var(--paper-2)',
                color: ready ? 'var(--paper)' : 'var(--ink-4)',
                padding: '0 28px',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: ready ? 'pointer' : 'not-allowed',
                borderLeft: '1px solid var(--ink)',
                minWidth: 160,
              }}
            >
              Analyze →
            </button>
          </div>
        ) : (
          <div className="field" style={{ border: '1px solid var(--ink)', background: 'var(--paper)' }}>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste the full article text here. We need at least 100 characters to do a useful pass…"
              rows={9}
              style={{
                width: '100%',
                border: 0,
                background: 'transparent',
                padding: '18px',
                fontSize: 14,
                fontFamily: 'var(--mono)',
                color: 'var(--ink)',
                resize: 'vertical',
                lineHeight: 1.55,
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              borderTop: '1px solid var(--paper-rule)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--ink-3)',
              letterSpacing: '0.1em',
            }}>
              <span>
                {text.length} CHARS
                {text.length > 0 && text.length < 100 && (
                  <span style={{ color: 'var(--vermillion)', marginLeft: 10 }}>— NEED {100 - text.length} MORE</span>
                )}
                {text.length >= 100 && <span style={{ color: 'var(--moss)', marginLeft: 10 }}>— READY</span>}
              </span>
              <button
                onClick={submit}
                disabled={!ready}
                style={{
                  background: ready ? 'var(--ink)' : 'transparent',
                  color: ready ? 'var(--paper)' : 'var(--ink-4)',
                  padding: '10px 22px',
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  cursor: ready ? 'pointer' : 'not-allowed',
                  border: ready ? '0' : '1px solid var(--paper-rule)',
                }}
              >
                Analyze →
              </button>
            </div>
          </div>
        )}

        {/* Sample picks */}
        <div style={{ marginTop: 24 }}>
          <p className="smcap" style={{ color: 'var(--ink-3)', margin: '0 0 12px' }}>Try one of these</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {SAMPLE_URLS.map(s => (
              <SampleButton
                key={s.url}
                url={s.url}
                label={s.label}
                onPick={() => { setTab('url'); setUrl(s.url) }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <Marquee />
    </section>
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
        border: active ? '1px solid var(--ink)' : '1px solid var(--paper-rule)',
      }}
    >
      {children}
    </button>
  )
}

function SampleButton({ url, label, onPick }: { url: string; label: string; onPick: () => void }) {
  const [hovered, setHovered] = useState(false)
  let hostname = ''
  try { hostname = new URL(url).hostname } catch { hostname = url }

  return (
    <button
      onClick={onPick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: 'left',
        border: `1px solid ${hovered ? 'var(--ink)' : 'var(--paper-rule)'}`,
        padding: '12px 14px',
        background: 'transparent',
        cursor: 'pointer',
        display: 'block',
        transition: 'border-color 120ms ease',
      }}
    >
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        {hostname}
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.15, marginTop: 4, color: 'var(--ink)' }}>
        {label.split(' — ')[1] || label}
      </div>
    </button>
  )
}

function Marquee() {
  const items = [
    'MEDIA LITERACY', '·',
    '1,824 ARTICLES ANALYZED THIS WEEK', '·',
    'FOUR-PASS LLM REVIEW', '·',
    'FACT-CHECKER CROSS-REFERENCE', '·',
    'OPEN METHODOLOGY', '·',
    'NO ACCOUNT REQUIRED', '·',
  ]
  const repeated = [...items, ...items, ...items, ...items]
  return (
    <div style={{
      borderTop: '1px solid var(--paper-rule)',
      borderBottom: '1px solid var(--paper-rule)',
      overflow: 'hidden',
      padding: '12px 0',
      marginTop: 20,
    }}>
      <div style={{
        display: 'flex',
        gap: 28,
        whiteSpace: 'nowrap',
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.22em',
        color: 'var(--ink-3)',
        animation: 'ticker 38s linear infinite',
        width: 'max-content',
      }}>
        {repeated.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  )
}
