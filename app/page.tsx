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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                FactNews
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time news summaries
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-gray-50 border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <SearchBar onSubmit={handleSearch} disabled={loading} />
          <CategoryChips onSelect={handleSearch} disabled={loading} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="font-bold text-red-900">Error</p>
            <p className="text-red-800 text-sm mt-1">{error}</p>
          </div>
        )}

        {loading && <SkeletonCard />}

        {result && !loading && <SummaryCard data={result} />}

        {!loading && !result && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Search for a topic to get started</p>
          </div>
        )}
      </div>
    </main>
  )
}
