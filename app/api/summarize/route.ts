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
        },
      })
    }

    // Call Grok API
    const stream = await callGrokAPI(trimmedTopic)

    // Create a passthrough that captures the response for caching
    let fullResponse = ''

    // Convert the stream to text and collect it
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
    } finally {
      reader.releaseLock()
    }

    // Combine chunks
    const combined = new TextEncoder().encode(
      chunks.map((chunk) => new TextDecoder().decode(chunk)).join('')
    )

    // Parse the response to extract JSON and format as SSE
    const responseText = new TextDecoder().decode(combined)
    const lines = responseText.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        try {
          const parsed = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>
          }
          if (parsed.choices?.[0]?.delta?.content) {
            fullResponse += parsed.choices[0].delta.content
          }
        } catch {
          // Ignore parsing errors for individual chunks
        }
      }
    }

    // Try to parse the full response as JSON
    try {
      const summaryData = JSON.parse(fullResponse) as SummaryResponse
      const sseMessage = `data: ${JSON.stringify(summaryData)}\n\n`
      fullResponse = sseMessage

      // Cache the result
      await setCached(cacheKey, sseMessage, CACHE_TTL_SECONDS)

      return new Response(fullResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      })
    } catch {
      // If parsing fails, return the raw response
      return new Response(fullResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
