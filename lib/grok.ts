import { SYSTEM_PROMPT } from './prompts'

export async function callGrokAPI(topic: string): Promise<string> {
  const apiKey = process.env.GROK_API_KEY

  if (!apiKey) {
    throw new Error('GROK_API_KEY environment variable is not set')
  }

  const userPrompt = `${SYSTEM_PROMPT}\n\nSummarize the latest news on: ${topic}`

  try {
    console.log('Calling Grok API with topic:', topic)
    console.log('API Key exists:', !!apiKey)

    const response = await fetch('https://api.x.ai/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4.20-reasoning',
        input: userPrompt,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Grok API error: ${response.status} ${response.statusText}`)
      console.error('Response body:', errorText)

      if (response.status === 410) {
        throw new Error('Grok API error: Endpoint not found - API may have changed')
      }
      if (response.status === 401) {
        throw new Error('Grok API error: Unauthorized - check your API key')
      }
      if (response.status === 429) {
        throw new Error('Grok API error: Rate limited - too many requests')
      }

      throw new Error(`Grok API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as { output?: string }
    const output = data.output

    if (!output) {
      throw new Error('Grok API returned no output')
    }

    return output
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Grok API call failed:', message)
    throw error
  }
}
