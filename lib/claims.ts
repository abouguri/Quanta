import { Claim } from '@/types/analysis'
import { CLAIM_EXTRACTION_PROMPT } from './prompts'
import { callGroq, GroqError, parseJsonResponse } from './groq'

export async function extractClaims(articleText: string, language: string = 'en'): Promise<Claim[]> {
  const truncated = articleText.substring(0, 6000)
  const languageNote = language === 'ar' ? '\nNote: The article may be in Arabic. Extract the claims as written.' : ''

  const raw = await callGroq(CLAIM_EXTRACTION_PROMPT + languageNote, `Article:\n${truncated}`)
  const parsed = parseJsonResponse<{ claims: Claim[] }>(raw)

  if (!parsed) {
    throw new GroqError('Claim extraction returned malformed JSON', false)
  }

  return Array.isArray(parsed.claims)
    ? parsed.claims.filter(c => typeof c?.text === 'string' && c.text.trim().length > 0).slice(0, 5)
    : []
}
