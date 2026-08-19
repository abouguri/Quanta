import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findFactCheck, normalizeRating, searchBrave, searchFactCheckDB } from '@/lib/factcheck'
import type { Claim } from '@/types/analysis'

const CLAIM: Claim = {
  text: 'Unemployment fell to 3.1% last quarter.',
  claimant: 'the mayor',
  context: 'central to the article',
  topic: 'economics',
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('normalizeRating', () => {
  it.each(['True', 'Accurate', 'Correct', 'Verified'])('reads %s as TRUE', r => {
    expect(normalizeRating(r)).toBe('TRUE')
  })

  it.each(['False', 'Incorrect', 'Fabricated', 'Pants on Fire', 'Debunked', 'No evidence'])(
    'reads %s as FALSE',
    r => {
      expect(normalizeRating(r)).toBe('FALSE')
    },
  )

  // The regression this ordering exists for: every one of these contains the
  // word "true" and used to come back as a clean TRUE, scoring a hedged
  // fact-check as a full endorsement.
  it.each(['Mostly True', 'Half True', 'Partly true', 'Partially accurate', 'Mixture'])(
    'reads %s as MIXED, not TRUE',
    r => {
      expect(normalizeRating(r)).toBe('MIXED')
    },
  )

  it.each(['Not true', 'Untrue', 'Inaccurate', 'Not accurate'])(
    'reads the negation %s as FALSE, not TRUE',
    r => {
      expect(normalizeRating(r)).toBe('FALSE')
    },
  )

  it('reads "Mostly False" as FALSE rather than MIXED', () => {
    expect(normalizeRating('Mostly False')).toBe('FALSE')
  })

  it.each(['Misleading', 'Missing context / distorted', 'Manipulated media'])(
    'reads %s as MISLEADING',
    r => {
      expect(normalizeRating(r)).toBe('MISLEADING')
    },
  )

  it('falls back to UNVERIFIED for a rating it does not recognise', () => {
    expect(normalizeRating('Unproven')).toBe('UNVERIFIED')
    expect(normalizeRating('')).toBe('UNVERIFIED')
  })
})

describe('searchFactCheckDB', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.GOOGLE_FACT_CHECK_API_KEY = 'test-key'
  })

  it('returns null without an API key rather than calling out', async () => {
    delete process.env.GOOGLE_FACT_CHECK_API_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await expect(searchFactCheckDB(CLAIM)).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maps a publisher rating onto a verdict', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({
      claims: [{
        text: CLAIM.text,
        claimReview: [{
          publisher: { name: 'PolitiFact' },
          url: 'https://politifact.com/factchecks/1',
          textualRating: 'Mostly True',
        }],
      }],
    })))

    const result = await searchFactCheckDB(CLAIM)
    expect(result).toMatchObject({
      verdict: 'MIXED',
      confidence: 'high',
      source: 'factcheck_db',
      factCheckPublisher: 'PolitiFact',
      factCheckRating: 'Mostly True',
    })
  })

  it('returns null when the database has no hits', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ claims: [] })))
    await expect(searchFactCheckDB(CLAIM)).resolves.toBeNull()
  })

  it('returns null on an unusable response instead of throwing', async () => {
    // A non-JSON 200 used to throw straight out of the pipeline and fail the
    // whole analysis over one enrichment lookup.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>502</html>', { status: 200 })))
    await expect(searchFactCheckDB(CLAIM)).resolves.toBeNull()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({}, 500)))
    await expect(searchFactCheckDB(CLAIM)).resolves.toBeNull()

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')))
    await expect(searchFactCheckDB(CLAIM)).resolves.toBeNull()
  })
})

describe('searchBrave', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.BRAVE_SEARCH_API_KEY = 'test-key'
  })

  it('only accepts results from a known fact-checker', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({
      web: { results: [{ url: 'https://randomblog.example/post', title: 'x', description: 'y' }] },
    })))
    await expect(searchBrave(CLAIM)).resolves.toBeNull()
  })

  it('reports a fact-checker hit as UNVERIFIED with a link', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({
      web: {
        results: [
          { url: 'https://randomblog.example/post', title: 'x', description: 'y' },
          { url: 'https://snopes.com/fact-check/jobs', title: 'Jobs claim', description: 'We looked into it.' },
        ],
      },
    })))

    // The search only proves a fact-check exists; nothing here read its
    // rating, so the verdict stays UNVERIFIED on purpose.
    await expect(searchBrave(CLAIM)).resolves.toMatchObject({
      verdict: 'UNVERIFIED',
      confidence: 'medium',
      source: 'web_search',
      factCheckUrl: 'https://snopes.com/fact-check/jobs',
      factCheckPublisher: 'snopes',
    })
  })
})

describe('findFactCheck', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.GOOGLE_FACT_CHECK_API_KEY = 'test-key'
    process.env.BRAVE_SEARCH_API_KEY = 'test-key'
  })

  it('prefers the database and never reaches the search fallback', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({
      claims: [{ claimReview: [{ publisher: { name: 'AFP' }, url: 'https://afp.com/1', textualRating: 'False' }] }],
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(findFactCheck(CLAIM)).resolves.toMatchObject({ source: 'factcheck_db', verdict: 'FALSE' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('falls through to search when the database is empty', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ claims: [] }))
      .mockResolvedValueOnce(json({
        web: { results: [{ url: 'https://factcheck.org/2026/jobs', title: 't', description: 'd' }] },
      }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(findFactCheck(CLAIM)).resolves.toMatchObject({ source: 'web_search' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns null when neither source has anything', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ claims: [], web: { results: [] } })))
    await expect(findFactCheck(CLAIM)).resolves.toBeNull()
  })
})
