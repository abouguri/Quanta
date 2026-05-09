'use client'

import { useState, useEffect } from 'react'
import { SearchBar } from '@/components/SearchBar'
import { CategoryChips } from '@/components/CategoryChips'
import { SummaryCard } from '@/components/SummaryCard'
import { SkeletonCard } from '@/components/SkeletonCard'
import { SummaryResponse } from '@/types/summary'

// Declare Puter global type
declare const puter: {
  ai: {
    chat: (
      prompt: string,
      options: { model: string; stream?: boolean }
    ) => Promise<{ message?: { content: string } }>
  }
}

const SYSTEM_PROMPT = `You are a real-time news summarizer with live web access.

When given a topic, search for the latest news from the past 24 hours and return ONLY a valid JSON object — no markdown, no preamble — in this exact shape:

{
  "headline": "One sentence. The single most important development right now.",
  "bullets": [
    "Key fact 1 — max 25 words",
    "Key fact 2 — max 25 words",
    "Key fact 3 — max 25 words",
    "Key fact 4 — max 25 words"
  ],
  "bottom_line": "Two sentences. Plain-English takeaway for someone who has no background on this topic.",
  "tone": "neutral" | "mixed" | "heated",
  "freshness": "How recent is the latest source? e.g. '2 hours ago'",
  "sources": [
    { "title": "Source name", "url": "https://..." },
    { "title": "Source name", "url": "https://..." },
    { "title": "Source name", "url": "https://..." }
  ]
}

Tone definitions:
- neutral: factual reporting, no strong editorial angle
- mixed: coverage varies significantly across sources
- heated: strong language, high conflict, polarized coverage

Be factual. Do not editorialize. If there is no significant news in the past 24h, say so in the headline and set tone to "neutral".`

export default function Home(): React.ReactElement {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [puterReady, setPuterReady] = useState(false)

  // Load Puter.js script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.puter.com/v2/'
    script.onload = () => {
      setPuterReady(true)
    }
    script.onerror = () => {
      setError('Failed to load Puter.js - please refresh the page')
    }
    document.head.appendChild(script)
  }, [])

  const handleSearch = async (searchTopic: string): Promise<void> => {
    if (!puterReady) {
      setError('Puter.js is still loading. Please try again in a moment.')
      return
    }

    setTopic(searchTopic)
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const userPrompt = `${SYSTEM_PROMPT}\n\nSummarize the latest news on: ${searchTopic}`

      // Call Grok via Puter.js (user-pays model)
      const response = await puter.ai.chat(userPrompt, {
        model: 'x-ai/grok-4-1-fast',
      })

      const grokOutput = response.message?.content

      if (!grokOutput) {
        throw new Error('No response from Grok')
      }

      // Send to backend for parsing and caching
      const apiResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic, grokOutput }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json() as { error?: string }
        throw new Error(errorData.error || 'Failed to process summary')
      }

      const reader = apiResponse.body?.getReader()
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
            Real-time news summaries powered by Grok
          </p>
        </div>

        {/* Search Bar */}
        <div className="animate-fadeInUp">
          <SearchBar onSubmit={handleSearch} disabled={loading || !puterReady} />
          {!puterReady && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Loading AI service...
            </p>
          )}
        </div>

        {/* Category Chips */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <CategoryChips onSelect={handleSearch} disabled={loading || !puterReady} />
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
