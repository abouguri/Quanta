import { Claim, FactCheckResult } from '@/types/analysis'
import { SYNTHESIS_PROMPT } from './prompts'

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
      max_tokens: 512,
    }),
  })

  if (!response.ok) throw new Error(`Groq API error ${response.status}`)

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq API returned no output')
  return text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
}

export async function synthesizeClaim(claim: Claim, articleContext: string): Promise<FactCheckResult> {
  const context = articleContext.substring(0, 800)
  const userMessage = `Claim: "${claim.text}"\n\nArticle context (excerpt):\n${context}`

  try {
    const raw = await callGroq(SYNTHESIS_PROMPT, userMessage)
    const parsed = JSON.parse(raw) as { verdict: string; confidence: string; reasoning: string }
    return {
      claim,
      verdict: parsed.verdict as FactCheckResult['verdict'],
      confidence: parsed.confidence as FactCheckResult['confidence'],
      source: 'llm_assessment',
      summary: parsed.reasoning,
    }
  } catch {
    return {
      claim,
      verdict: 'UNVERIFIED',
      confidence: 'low',
      source: 'llm_assessment',
      summary: 'No independent fact-check found. Assessment unavailable.',
    }
  }
}
