import { describe, expect, it } from 'vitest'
import { analyzeStructure } from '@/lib/structural'

const CLEAN_METADATA = {
  title: 'Council approves transit funding',
  source: 'news.example.com',
  author: 'Dana Reporter',
  publishedDate: '2026-03-04',
}

/** Long enough to clear the short-content flag, plain enough to trip nothing else. */
const PLAIN_TEXT =
  'The council voted on Tuesday to approve the funding package. ' +
  'Officials said construction would begin in the spring. '.repeat(8)

const flagTypes = (text: string, metadata = CLEAN_METADATA) =>
  analyzeStructure(text, metadata).flags.map(f => f.type)

describe('analyzeStructure', () => {
  it('gives a fully attributed, plainly written article a clean sheet', () => {
    const result = analyzeStructure(PLAIN_TEXT, CLEAN_METADATA)
    expect(result.flags).toEqual([])
    expect(result.score).toBe(100)
    expect(result.metrics).toMatchObject({
      hasAuthor: true,
      hasDate: true,
      suspiciousDomain: false,
    })
  })

  it('flags a missing byline as high severity', () => {
    const result = analyzeStructure(PLAIN_TEXT, { ...CLEAN_METADATA, author: '' })
    expect(result.flags).toContainEqual(expect.objectContaining({
      type: 'No author attribution',
      severity: 'high',
    }))
    expect(result.score).toBe(80)
    expect(result.metrics.hasAuthor).toBe(false)
  })

  it('treats a one-character byline as no byline', () => {
    expect(flagTypes(PLAIN_TEXT, { ...CLEAN_METADATA, author: 'X' })).toContain('No author attribution')
  })

  it('flags a missing publish date as medium severity', () => {
    const result = analyzeStructure(PLAIN_TEXT, { ...CLEAN_METADATA, publishedDate: '' })
    expect(result.flags).toContainEqual(expect.objectContaining({
      type: 'No publish date',
      severity: 'medium',
    }))
    expect(result.score).toBe(90)
  })

  it('flags a TLD associated with low-credibility sites', () => {
    const result = analyzeStructure(PLAIN_TEXT, { ...CLEAN_METADATA, source: 'realnews.xyz' })
    expect(result.metrics.suspiciousDomain).toBe(true)
    expect(result.flags).toContainEqual(expect.objectContaining({
      type: 'Suspicious domain',
      severity: 'high',
    }))
  })

  it('leaves an ordinary TLD alone', () => {
    expect(flagTypes(PLAIN_TEXT, { ...CLEAN_METADATA, source: 'bbc.co.uk' }))
      .not.toContain('Suspicious domain')
  })

  it('separates elevated all-caps from excessive all-caps', () => {
    // capsRatio counts words over 3 characters: 2 of 20 here lands between the
    // 5% and 15% thresholds.
    const elevated =
      'BREAKING URGENT council members approved funding today after lengthy ' +
      'debate about transit routes across three separate northern districts overall.'
    expect(flagTypes(elevated)).toContain('Elevated all-caps')

    const excessive = 'BREAKING SHOCKING URGENT EXPOSED SCANDAL TRUTH REVEALED ALERT '.repeat(4)
    expect(flagTypes(excessive)).toContain('Excessive all-caps')
  })

  it('flags exclamation density at two thresholds', () => {
    const elevated = PLAIN_TEXT + 'What a result!'
    expect(flagTypes(elevated)).toContain('Elevated exclamations')

    const overused = 'They lied to you! Wake up now! Share this everywhere! It is happening! '.repeat(4)
    expect(flagTypes(overused)).toContain('Exclamation overuse')
  })

  it('flags very short content', () => {
    const result = analyzeStructure('Too little to judge here.', CLEAN_METADATA)
    expect(result.flags).toContainEqual(expect.objectContaining({
      type: 'Very short content',
      severity: 'medium',
    }))
    expect(result.metrics.articleLength).toBe(25)
  })

  it('sums penalties across every flag and never drops below zero', () => {
    const result = analyzeStructure(
      'THEY LIED! WAKE UP! SHARE THIS! IT IS HAPPENING NOW! '.repeat(3),
      { source: 'truth.xyz' },
    )
    expect(result.flags.length).toBeGreaterThanOrEqual(4)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThan(40)
  })

  it('does not divide by zero on empty input', () => {
    const result = analyzeStructure('', {})
    expect(result.metrics.capsRatio).toBe(0)
    expect(result.metrics.exclamationDensity).toBe(0)
    expect(Number.isFinite(result.score)).toBe(true)
  })
})
