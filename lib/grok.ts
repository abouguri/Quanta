import { SYSTEM_PROMPT } from './prompts'
import { fetchNewsArticles } from './news'

export async function callGrokAPI(topic: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set')
  }

  try {
    // Fetch real news articles first
    const articles = await fetchNewsArticles(topic)

    if (articles.length === 0) {
      throw new Error(`No recent news found for topic: ${topic}`)
    }

    // Format articles for the prompt
    const articlesText = articles
      .map((article, i) => `[${i + 1}] ${article.title}\n${article.description}\nSource: ${article.source.name}\nURL: ${article.url}`)
      .join('\n\n')

    const userPrompt = `${SYSTEM_PROMPT}\n\nRecent news articles on "${topic}":\n\n${articlesText}`

    console.log('Calling Groq API with topic:', topic)

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a news summarizer. Analyze the provided articles and return a JSON summary.' },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }

    console.log('Request created for topic:', topic)

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Groq API error: ${response.status} ${response.statusText}`)
      console.error('Response body:', errorText)

      if (response.status === 403) {
        throw new Error('API access forbidden - check your API key')
      }
      if (response.status === 401) {
        throw new Error('Unauthorized - invalid API key')
      }
      if (response.status === 429) {
        throw new Error('Rate limited - too many requests')
      }
      if (response.status === 400) {
        throw new Error(`Bad Request - Invalid request format. Details: ${errorText}`)
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
