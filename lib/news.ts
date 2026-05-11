export interface NewsArticle {
  title: string
  description: string
  url: string
  source: {
    name: string
  }
  publishedAt: string
}

export async function fetchNewsArticles(topic: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    throw new Error('NEWS_API_KEY environment variable is not set')
  }

  try {
    console.log('Fetching news articles for topic:', topic)

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&sortBy=publishedAt&language=en&pageSize=5`,
      {
        headers: {
          'X-API-Key': apiKey,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`NewsAPI error: ${response.status} ${response.statusText}`)
      console.error('Response:', errorText)
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as { articles?: NewsArticle[] }
    const articles = data.articles || []

    console.log(`Found ${articles.length} articles for topic: ${topic}`)

    return articles
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching news:', message)
    throw error
  }
}
