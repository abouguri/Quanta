import type { AnalysisErrorCode } from './types'

/**
 * Plain-English copy for the API's failure codes.
 *
 * Codes without an entry carry a message specific enough to show as-is
 * (which field, which limit). Anything we do not recognise falls back to the
 * server's sentence rather than an internal string reaching the popup.
 */
const CODE_COPY: Partial<Record<AnalysisErrorCode, string>> = {
  url_invalid: 'That page cannot be analyzed. Try a different article.',
  text_too_short: 'There is not enough text on this page to measure.',
  fetch_failed: 'Could not reach that page. Check your connection and try again.',
  scrape_failed: 'Could not read the article from this page.',
  rate_limited: 'Daily limit reached. Try again tomorrow.',
  analysis_failed: 'The analysis did not finish. Try again in a moment.',
  server_error: 'Quanta is temporarily unavailable. Try again shortly.',
}

export function resolveErrorMessage(code?: AnalysisErrorCode, message?: string): string {
  if (code && CODE_COPY[code]) return CODE_COPY[code]!
  return message || 'Something went wrong. Try again.'
}
