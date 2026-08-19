import { Claim, FactCheckResult, Verdict } from '@/types/analysis'

interface GoogleFCClaim {
  text?: string
  claimant?: string
  claimReview?: Array<{
    publisher?: { name?: string; site?: string }
    url?: string
    title?: string
    textualRating?: string
    languageCode?: string
  }>
}

interface GoogleFCResponse {
  claims?: GoogleFCClaim[]
}

/**
 * Fact-check lookups are best-effort enrichment, never the reason an analysis
 * fails. Every failure mode here — unreachable host, slow host, non-JSON body —
 * degrades to `null` so the caller falls through to the next source.
 */
const LOOKUP_TIMEOUT_MS = 8_000

async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS) })
    if (!response.ok) return null
    return await response.json() as T
  } catch {
    return null
  }
}

/**
 * Maps a fact-checker's free-text rating onto our verdict scale.
 *
 * Order matters: the qualified ratings are tested first because "Mostly True"
 * and "Half True" both contain "true", and used to come back as a clean TRUE —
 * scoring a hedged rating as if the fact-checker had fully endorsed it.
 */
export function normalizeRating(rating: string): Verdict {
  const r = rating.toLowerCase()

  // Explicit negations first: "not true" / "not accurate" also contain the
  // positive word they negate.
  if (/\b(not (true|accurate|correct)|untrue|inaccurate)\b/.test(r)) return 'FALSE'

  // These are word stems, so they take a leading boundary only: a trailing \b
  // after "mislead" cannot match "misleading", which left this branch dead and
  // every misleading rating scored as a bare UNVERIFIED.
  if (/\b(mislead|distort|manipulat|cherry.?pick|missing context|out of context|twisted)/.test(r)) return 'MISLEADING'

  if (/\b(mostly|half|partially|partly|mixture|mixed|barely|some truth)\b/.test(r)) return /\bmostly false\b/.test(r)
    ? 'FALSE'
    : 'MIXED'

  if (/\b(false|incorrect|wrong|fabricated|no evidence|debunked|pants on fire|hoax)\b/.test(r)) return 'FALSE'

  if (/\b(true|accurate|correct|verified|confirmed)\b/.test(r)) return 'TRUE'

  return 'UNVERIFIED'
}

export async function searchFactCheckDB(claim: Claim): Promise<FactCheckResult | null> {
  const apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY
  if (!apiKey) return null

  const query = encodeURIComponent(claim.text.substring(0, 200))
  const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${query}&key=${apiKey}&languageCode=en&pageSize=3`

  const data = await fetchJson<GoogleFCResponse>(url)
  if (!data) return null

  const hits = data.claims ?? []
  if (hits.length === 0) return null

  const best = hits[0]
  const review = best.claimReview?.[0]
  if (!review?.url) return null

  const rating = review.textualRating ?? 'Unverified'
  const verdict = normalizeRating(rating)

  return {
    claim,
    verdict,
    confidence: 'high',
    source: 'factcheck_db',
    factCheckUrl: review.url,
    factCheckPublisher: review.publisher?.name ?? review.publisher?.site,
    factCheckRating: rating,
    summary: `${review.publisher?.name ?? 'Fact-checker'} rated this claim as "${rating}".`,
  }
}

export async function searchBrave(claim: Claim): Promise<FactCheckResult | null> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  if (!apiKey) return null

  const terms = claim.text.split(/\s+/).slice(0, 10).join(' ')
  const query = encodeURIComponent(`${terms} fact check`)
  const url = `https://api.search.brave.com/res/v1/web/search?q=${query}&count=3`

  const data = await fetchJson<{ web?: { results?: Array<{ url: string; title: string; description: string }> } }>(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': apiKey,
    },
  })
  if (!data) return null

  const results = data.web?.results ?? []
  const factCheckSites = ['snopes.com', 'politifact.com', 'factcheck.org', 'reuters.com/fact-check', 'apnews.com/APFactCheck', 'bbc.com/news/reality_check', 'fullfact.org', 'afp.com/en/news/1479']

  const match = results.find(r => factCheckSites.some(site => r.url.includes(site)))
  if (!match) return null

  const publisherMatch = factCheckSites.find(site => match.url.includes(site))
  const publisher = publisherMatch?.split('.')[0] ?? 'Fact-checker'

  return {
    claim,
    verdict: 'UNVERIFIED',
    confidence: 'medium',
    source: 'web_search',
    factCheckUrl: match.url,
    factCheckPublisher: publisher,
    summary: match.description || `Found a related fact-check article from ${publisher}.`,
  }
}

export async function findFactCheck(claim: Claim): Promise<FactCheckResult | null> {
  const dbResult = await searchFactCheckDB(claim)
  if (dbResult) return dbResult

  const searchResult = await searchBrave(claim)
  return searchResult
}
