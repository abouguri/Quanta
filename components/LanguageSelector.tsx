'use client'

import { useTranslation } from '@/lib/i18n'

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'ع' },
] as const

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation()

  return (
    <div style={{ display: 'inline-flex', border: '0.5px solid rgba(255,255,255,0.24)', borderRadius: 12, overflow: 'hidden' }}>
      {LANGUAGES.map(({ code, label }) => {
        const active = language === code
        return (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            aria-pressed={active}
            title={code === 'en' ? 'English' : 'العربية'}
            className="q-tap-target"
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.06em',
              padding: '0 7px',
              height: 24,
              cursor: 'pointer',
              background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
              color: active ? 'var(--on-deep)' : 'rgba(255,255,235,0.6)',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
