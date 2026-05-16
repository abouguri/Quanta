'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

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
    <section className="animate-fadeUp" style={{ display: 'grid', gap: 44, paddingTop: 8 }}>
      {/* Hero */}
      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: 'var(--sans)',
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--ember)',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          marginBottom: 24,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--ember)' }} />
          The credibility layer for the internet
        </div>
        <h1 style={{
          fontFamily: 'var(--sans)',
          fontWeight: 500,
          fontSize: 'clamp(56px, 8vw, 96px)',
          lineHeight: 1.0,
          letterSpacing: '-0.035em',
          color: 'var(--ink)',
          margin: 0,
        }}>
          Measure.<br />
          Understand.<br />
          Elevate<span style={{ color: 'var(--ember)' }}>.</span>
        </h1>
        <p style={{
          margin: '32px 0 0',
          maxWidth: '52ch',
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 21,
          lineHeight: 1.45,
          color: 'var(--ink-2)',
        }}>
          Paste a news article. Quanta measures bias, evidence, source provenance, and confidence — and shows its work, sentence by sentence. Read with your eyes open.
        </p>
      </div>

      {/* Input block */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <TabBtn active={tab === 'url'} onClick={() => setTab('url')}>{t('input.urlTab')}</TabBtn>
            <TabBtn active={tab === 'text'} onClick={() => setTab('text')}>{t('input.textTab')}</TabBtn>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>
            {t('input.enterHint')}
          </div>
        </div>

        {tab === 'url' ? (
          <div className="field" style={{
            border: '1px solid var(--ink)',
            display: 'flex',
            alignItems: 'stretch',
            background: 'var(--paper)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <span style={{
              padding: '0 18px',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--ink-3)',
              borderRight: '0.5px solid var(--fog)',
              alignSelf: 'stretch',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>{t('input.urlPrefix')}</span>
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={handleKey}
              placeholder="https://"
              spellCheck={false}
              style={{
                flex: 1,
                border: 0,
                background: 'transparent',
                padding: '20px 18px',
                fontSize: 15,
                fontFamily: 'var(--mono)',
                color: 'var(--ink)',
                minWidth: 0,
              }}
            />
            <button
              onClick={submit}
              disabled={!ready}
              style={{
                background: ready ? 'var(--ink)' : 'var(--fog)',
                color: ready ? 'var(--bone)' : 'var(--ink-4)',
                padding: '0 32px',
                fontFamily: 'var(--sans)',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '0.01em',
                cursor: ready ? 'pointer' : 'not-allowed',
                border: 0,
                minWidth: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              Measure <span>→</span>
            </button>
          </div>
        ) : (
          <div className="field" style={{ border: '1px solid var(--ink)', background: 'var(--paper)' }}>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t('input.textPlaceholder')}
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
                {text.length} {t('input.charactersLabel').toUpperCase()}
                {text.length > 0 && text.length < 100 && (
                  <span style={{ color: 'var(--vermillion)', marginLeft: 10 }}>
                    {t('input.charsNeedMore', { n: 100 - text.length })}
                  </span>
                )}
                {text.length >= 100 && (
                  <span style={{ color: 'var(--moss)', marginLeft: 10 }}>{t('input.charsReady')}</span>
                )}
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
                {t('input.submitButton')}
              </button>
            </div>
          </div>
        )}

        {/* Sample picks */}
        <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginRight: 4,
          }}>Try one</span>
          {SAMPLE_URLS.map(s => {
            let host = ''
            try { host = new URL(s.url).hostname } catch { host = s.url }
            return (
              <button
                key={s.url}
                type="button"
                onClick={() => { setTab('url'); setUrl(s.url) }}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  background: 'transparent',
                  border: '0.5px solid var(--fog)',
                  color: 'var(--ink)',
                  padding: '7px 14px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                {host} ↗
              </button>
            )
          })}
        </div>
      </div>
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

