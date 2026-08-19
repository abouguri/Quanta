import type { AnalysisErrorCode } from '@/types/analysis'

/**
 * Maps the API's failure codes onto translated copy.
 *
 * Codes without an entry — `bad_request`, `text_too_long` — carry a message
 * specific enough to show as-is (which field, which limit); inventing a vague
 * translated line for those would tell the user less.
 */
const CODE_TO_KEY: Partial<Record<AnalysisErrorCode, string>> = {
  url_invalid: 'error.urlInvalid',
  text_too_short: 'error.textTooShort',
  fetch_failed: 'error.fetchFailed',
  scrape_failed: 'error.scrapeFailed',
  rate_limited: 'error.rateLimited',
  analysis_failed: 'error.analysisFailed',
  server_error: 'error.apiError',
}

export interface AnalysisFailure {
  code?: string
  message?: string
}

/**
 * Picks what to show the user: a translated line when we recognise the code,
 * the server's own sentence when we do not, and a generic line as the floor.
 * Nothing internal ("Groq API error 503") should reach the screen.
 */
export function resolveErrorMessage(
  failure: AnalysisFailure,
  t: (key: string) => string,
): string {
  const key = failure.code ? CODE_TO_KEY[failure.code as AnalysisErrorCode] : undefined
  if (key) return t(key)
  if (failure.message) return failure.message
  return t('error.generic')
}
