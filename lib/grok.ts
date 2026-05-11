import { SYSTEM_PROMPT } from './prompts'

export async function callGrokAPI(topic: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }

  const userPrompt = `${SYSTEM_PROMPT}\n\nSummarize the latest news on: ${topic}`

  try {
    console.log('Calling Groq API with topic:', topic)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Summarize the latest news on: ${topic}` },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Groq API error: ${response.status} ${response.statusText}`)
      console.error('Response:', errorText)

      if (response.status === 403) {
        throw new Error('API access forbidden - check your API key')
      }
      if (response.status === 401) {
        throw new Error('Unauthorized - invalid API key')
      }
      if (response.status === 429) {
        throw new Error('Rate limited - too many requests')
      }

      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const output = data.choices?.[0]?.message?.content

    if (!output) {
      throw new Error('Groq API returned no output')
    }

    return output
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Grok API call failed:', message)
    throw error
  }
}
