'use client'

import { useState } from 'react'
import { ArticleInput } from '@/components/ArticleInput'
import { CredibilityReport } from '@/components/CredibilityReport'
import { SourceCredibilityCard } from '@/components/SourceCredibilityCard'
import { AnalysisResult } from '@/types/analysis'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSelector } from '@/components/LanguageSelector'
import { CopyButton } from '@/components/CopyButton'
import { AnalysisHistory } from '@/components/AnalysisHistory'
import { useTranslation } from '@/lib/i18n'
import { saveAnalysis } from '@/lib/history'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { t, language } = useTranslation()

  const handleAnalyze = async (url: string | null, text: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const body = url 
        ? { articleUrl: url, language } 
        : { articleText: text, language }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json() as { error?: string }
        let errorKey = 'error.generic'
        
        if (errorData.error?.includes('100 characters')) {
          errorKey = 'error.textTooShort'
        } else if (errorData.error?.includes('invalid')) {
          errorKey = 'error.urlInvalid'
        } else if (errorData.error?.includes('429') || errorData.error?.includes('rate limit')) {
          errorKey = 'error.rateLimited'
        } else if (errorData.error?.includes('fetch')) {
          errorKey = 'error.fetchFailed'
        } else if (errorData.error?.includes('scrape')) {
          errorKey = 'error.scrapeFailed'
        }
        
        throw new Error(t(errorKey))
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error(t('error.apiError'))

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        buffer += chunk

        const lines = buffer.split('\n')
        buffer = lines[lines.length - 1]

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i]
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as AnalysisResult
              setResult(data)
              // Save to history
              saveAnalysis(data, url || undefined)
            } catch {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('error.generic')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">FactNews</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('header.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <div className="mb-8">
          <ArticleInput onSubmit={handleAnalyze} disabled={loading} />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4 mb-6 rounded-none">
            <p className="font-bold text-red-900 dark:text-red-200">{t('error.title')}</p>
            <p className="text-red-800 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-none" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-none" />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 justify-end">
              <CopyButton result={result} />
            </div>
            <div className="animate-fadeInUp">
              <SourceCredibilityCard url={result.metadata?.source} />
              <CredibilityReport result={result} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !result && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('empty.message')}</p>
              </div>
            </div>
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-none">
              <AnalysisHistory />
            </div>
          </div>
        )}

        {/* Results with History */}
        {result && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2" />
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-none">
              <AnalysisHistory />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

