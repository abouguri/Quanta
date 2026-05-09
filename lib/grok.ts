import { SYSTEM_PROMPT } from './prompts'

export async function callGrokAPI(topic: string): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GROK_API_KEY

  if (!apiKey) {
    throw new Error('GROK_API_KEY environment variable is not set')
  }

  const requestBody = {
    model: 'grok-3-mini',
    stream: true,
    search_parameters: {
      mode: 'auto',
    },
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Summarize the latest news on: ${topic}` },
    ],
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Grok API error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Grok API error: ${response.status} ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('Grok API returned no response body')
    }

    return response.body
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Grok API call failed:', message)
    throw error
  }
}
