'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import en from './translations/en.json'
import ar from './translations/ar.json'

type Language = 'en' | 'ar'

interface TranslationContextType {
  language: Language
  t: (path: string, replacements?: Record<string, string | number>) => string
  setLanguage: (lang: Language) => void
}

const translations = { en, ar }

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj) || path
}

const STORAGE_KEY = 'language'

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  // Read on mount rather than during render — the server has no localStorage,
  // and reading it in the initial state would desync hydration.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en' || stored === 'ar') setLanguageState(stored)
    } catch { /* private mode */ }
  }, [])

  // <html lang>/<dir> are what screen readers, search engines and the browser's
  // own text rendering read. They were pinned to English while the UI switched
  // to Arabic underneath.
  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch { /* private mode */ }
  }

  const t = (path: string, replacements?: Record<string, string | number>): string => {
    let value = getNestedValue(translations[language], path)
    
    if (replacements) {
      Object.entries(replacements).forEach(([key, val]) => {
        value = value.replace(`{${key}}`, String(val))
      })
    }
    
    return value
  }

  return (
    <TranslationContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
