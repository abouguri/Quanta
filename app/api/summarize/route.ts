import { callGrokAPI } from '@/lib/grok'
import { getCached, setCached } from '@/lib/cache'
import { SummaryResponse } from '@/types/summary'

const CACHE_TTL_SECONDS = 300 // 5 minutes

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { topic?: string }
    const { topic } = body

    // Validate input
    if (!topic || typeof topic !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid topic' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const trimmedTopic = topic.trim()
    if (trimmedTopic.length === 0 || trimmedTopic.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Topic must be 1-200 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const cacheKey = `news:${trimmedTopic.toLowerCase()}`

    // Check cache first
    const cached = await getCached(cacheKey)
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Call Grok API
    const grokOutput = await callGrokAPI(trimmedTopic)

    // Parse the JSON response from Grok
    let summaryData: SummaryResponse
    try {
      summaryData = JSON.parse(grokOutput) as SummaryResponse
    } catch {
      // If Grok returns plain text, create a structured response
      summaryData = {
        headline: grokOutput.split('\n')[0] || 'Unable to summarize',
        bullets: grokOutput.split('\n').slice(0, 4),
        bottom_line: grokOutput,
        tone: 'neutral',
        freshness: 'just now',
        sources: [],
      }
    }

    // Format as SSE message and cache it
    const sseMessage = `data: ${JSON.stringify(summaryData)}\n\n`
    await setCached(cacheKey, sseMessage, CACHE_TTL_SECONDS)

    return new Response(sseMessage, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Summarize API error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
