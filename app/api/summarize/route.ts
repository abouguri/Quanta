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
    const stream = await callGrokAPI(trimmedTopic)

    // Read the entire stream to extract the JSON response
    const reader = stream.getReader()
    let fullText = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += new TextDecoder().decode(value)
      }
    } finally {
      reader.releaseLock()
    }

    // Parse the streamed response to extract JSON chunks
    let jsonContent = ''
    const lines = fullText.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim()
        if (jsonStr && jsonStr !== '[DONE]') {
          try {
            const chunk = JSON.parse(jsonStr) as {
              choices?: Array<{ delta?: { content?: string } }>
            }
            if (chunk.choices?.[0]?.delta?.content) {
              jsonContent += chunk.choices[0].delta.content
            }
          } catch {
            // Ignore parsing errors for individual chunks
          }
        }
      }
    }

    // Parse the accumulated JSON content
    const summaryData = JSON.parse(jsonContent) as SummaryResponse

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
