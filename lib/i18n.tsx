'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
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

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

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
