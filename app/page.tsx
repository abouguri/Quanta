'use client'

import { useState } from 'react'
import { ArticleInput } from '@/components/ArticleInput'
import { CredibilityReport } from '@/components/CredibilityReport'
import { AnalysisResult } from '@/types/analysis'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (url: string | null, text: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const body = url ? { articleUrl: url } : { articleText: text }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json() as { error?: string }
        throw new Error(errorData.error || 'Failed to analyze article')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

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
            } catch {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900">FactsNews</h1>
          <p className="text-sm text-gray-600 mt-1">
            Analyze news credibility, detect misinformation, and evaluate bias
          </p>
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
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="font-bold text-red-900">Error</p>
            <p className="text-red-800 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 animate-pulse rounded-none" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-none" />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="animate-fadeInUp">
            <CredibilityReport result={result} />
          </div>
        )}

        {/* Empty State */}
        {!loading && !result && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Paste a URL or article text to analyze credibility</p>
          </div>
        )}
      </div>
    </main>
  )
}

