import { Claim } from '@/types/analysis'
import { CLAIM_EXTRACTION_PROMPT } from './prompts'

async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Groq API error ${response.status}: ${body}`)
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq API returned no output')
  return text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
}

export async function extractClaims(articleText: string, language: string = 'en'): Promise<Claim[]> {
  const truncated = articleText.substring(0, 6000)
  const languageNote = language === 'ar' ? '\nNote: The article may be in Arabic. Extract the claims as written.' : ''
  const raw = await callGroq(CLAIM_EXTRACTION_PROMPT + languageNote, `Article:\n${truncated}`)
  const parsed = JSON.parse(raw) as { claims: Claim[] }
  return Array.isArray(parsed.claims) ? parsed.claims.slice(0, 5) : []
}
