'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { CategoryChips } from '@/components/CategoryChips'
import { SummaryCard } from '@/components/SummaryCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { SummaryResponse } from '@/types/summary'

export default function Home(): React.ReactElement {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (searchTopic: string): Promise<void> => {
    setTopic(searchTopic)
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic }),
      })

      if (!response.ok) {
        const errorData = await response.json() as { error?: string }
        throw new Error(errorData.error || 'Failed to fetch summary')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        buffer += chunk

        // Process complete SSE messages
        const lines = buffer.split('\n')
        buffer = lines[lines.length - 1] // Keep incomplete line

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i]
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as SummaryResponse
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              FactNews
            </h1>
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
              Live
            </span>
          </div>
          <p className="text-gray-600 text-lg">
            Real-time news summaries powered by AI
          </p>
        </div>

        {/* Search Bar */}
        <div className="animate-fadeInUp">
          <SearchBar onSubmit={handleSearch} disabled={loading} />
        </div>

        {/* Category Chips */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <CategoryChips onSelect={handleSearch} disabled={loading} />
        </div>

        {/* Results */}
        <div
          className="animate-fadeInUp"
          style={{ animationDelay: '0.2s' }}
        >
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {loading && <SkeletonCard />}

          {result && !loading && (
            <div className="animate-fadeInUp">
              <SummaryCard data={result} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
