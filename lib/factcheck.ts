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

function normalizeRating(rating: string): Verdict {
  const r = rating.toLowerCase()
  if (/\b(true|accurate|correct|verified)\b/.test(r) && !/false|mislead|inaccur/.test(r)) return 'TRUE'
  if (/\b(false|incorrect|wrong|fabricated|no evidence)\b/.test(r)) return 'FALSE'
  if (/\b(mislead|distort|manipulat|out of context|twisted)\b/.test(r)) return 'MISLEADING'
  if (/\b(mostly true|half|partially|mixed|partly|some)\b/.test(r)) return 'MIXED'
  return 'UNVERIFIED'
}

export async function searchFactCheckDB(claim: Claim): Promise<FactCheckResult | null> {
  const apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY
  if (!apiKey) return null

  const query = encodeURIComponent(claim.text.substring(0, 200))
  const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${query}&key=${apiKey}&languageCode=en&pageSize=3`

  let response: Response
  try {
    response = await fetch(url)
  } catch {
    return null
  }

  if (!response.ok) return null

  const data = await response.json() as GoogleFCResponse
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

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
    })
  } catch {
    return null
  }

  if (!response.ok) return null

  const data = await response.json() as { web?: { results?: Array<{ url: string; title: string; description: string }> } }
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
