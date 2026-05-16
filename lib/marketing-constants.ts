/**
 * Design system constants and utilities for the Quanta marketing site
 */

export const TONE_HEX = {
  verified: '#2E7D5B',
  mixed: '#C77A2E',
  disputed: '#B33A3A',
  unclear: '#6B6B6B',
} as const

export const TONE_LABEL = {
  verified: 'Well-supported',
  mixed: 'Needs context',
  disputed: 'Read with caution',
  unclear: 'Insufficient signal',
} as const

export const COLORS = {
  'ink-navy': '#0F2233',
  bone: '#F4F1E9',
  ember: '#E6A23C',
  paper: '#FBF9F3',
  mist: '#EFEBE0',
  fog: '#DDD7C6',
  slate: '#5B6770',
  graphite: '#333E48',
  'verified-green': '#2E7D5B',
  'mixed-amber': '#C77A2E',
  'disputed-red': '#B33A3A',
  'unclear-gray': '#6B6B6B',
} as const

export const FONTS = {
  sans: "'Urbanist', 'Inter', system-ui, -apple-system, sans-serif",
  serif: "'Source Serif 4', 'Tiempos Text', Georgia, serif",
  mono: "'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace",
} as const

export const SPACING = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const

export const RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  pill: '999px',
} as const

export const SAMPLE_ANALYSES = {
  'apnews.com/fed-rates-march-2026': {
    headline: 'Federal Reserve holds rates steady amid mixed inflation signals',
    host: 'apnews.com',
    author: 'Jeanne Whalen',
    published: 'Apr 27, 2026',
    readTime: '7 min read',
    overall: 78,
    confidence: 94,
    signal: 'verified' as const,
    dimensions: [
      { label: 'Evidence', value: 87, tone: 'verified' as const },
      { label: 'Source diversity', value: 72, tone: 'verified' as const },
      { label: 'Framing balance', value: 64, tone: 'mixed' as const },
      { label: 'Emotional loading', value: 31, tone: 'mixed' as const },
      { label: 'Outlet track record', value: 89, tone: 'verified' as const },
    ],
    summary:
      "Three of five citations resolved to primary sources. Framing leans slightly toward the Fed's preferred narrative — read another view too. Outlet has a strong track record on economic reporting.",
  },
  'theatlantic.com/slow-ai': {
    headline: 'The case for slowing AI deployment',
    host: 'theatlantic.com',
    author: 'Ross Andersen',
    published: 'May 12, 2026',
    readTime: '14 min read',
    overall: 64,
    confidence: 81,
    signal: 'mixed' as const,
    dimensions: [
      { label: 'Evidence', value: 68, tone: 'mixed' as const },
      { label: 'Source diversity', value: 81, tone: 'verified' as const },
      { label: 'Framing balance', value: 42, tone: 'mixed' as const },
      { label: 'Emotional loading', value: 58, tone: 'mixed' as const },
      { label: 'Outlet track record', value: 84, tone: 'verified' as const },
    ],
    summary:
      'Opinion piece. Strong source diversity across academic and industry voices, but the argument is one-sided by design — counter-evidence appears only in the final third, after the framing is set.',
  },
  'reuters.com/eu-ukraine-summit': {
    headline: 'EU summit closes with mixed signals on Ukraine aid',
    host: 'reuters.com',
    author: 'Andrew Gray',
    published: 'May 14, 2026',
    readTime: '5 min read',
    overall: 89,
    confidence: 97,
    signal: 'verified' as const,
    dimensions: [
      { label: 'Evidence', value: 92, tone: 'verified' as const },
      { label: 'Source diversity', value: 88, tone: 'verified' as const },
      { label: 'Framing balance', value: 86, tone: 'verified' as const },
      { label: 'Emotional loading', value: 14, tone: 'verified' as const },
      { label: 'Outlet track record', value: 94, tone: 'verified' as const },
    ],
    summary:
      'Wire report. Five named sources across three EU member states, including direct quotes from two foreign ministers. Framing is neutral; emotional loading is near the floor for political reporting.',
  },
}

export const SIGNALS_DATA = [
  {
    code: '01',
    name: 'Evidence',
    short: 'How well-supported are the central claims?',
    detail:
      'Every claim in the article is identified and traced. We count primary citations, secondary citations, and unsupported assertions. A claim without a verifiable source isn't flagged as false — it's flagged as unverified.',
    sample: { Verified: 14, Partial: 5, Unsupported: 2 },
    tone: 'verified' as const,
  },
  {
    code: '02',
    name: 'Source provenance',
    short: 'Where do the citations actually lead?',
    detail:
      'Citations are followed. A link to a press release counts differently than a link to a peer-reviewed study or a regulatory filing. Circular citations — where outlets cite each other instead of the source — are surfaced.',
    sample: { Primary: 9, Secondary: 6, Circular: 2 },
    tone: 'verified' as const,
  },
  {
    code: '03',
    name: 'Framing',
    short: 'Whose perspective is missing?',
    detail:
      'We map the named voices, attribution patterns, and which side of an issue receives more space. Framing isn't left vs. right — it's a fingerprint that shows what the article emphasizes and what it elides.',
    sample: { 'Voices A': 62, 'Voices B': 28, Neutral: 10 },
    tone: 'mixed' as const,
  },
  {
    code: '04',
    name: 'Confidence',
    short: 'How sure are we of our own analysis?',
    detail:
      'Every score comes with a confidence interval. A short opinion piece with ambiguous claims gets lower confidence than a 2,000-word investigation. We'd rather tell you "we don't know yet" than guess.',
    sample: { '± conf.': '94%' },
    tone: 'verified' as const,
  },
]

export const COMPARISON_ROWS = [
  {
    host: 'apnews.com',
    headline: 'Federal Reserve holds rates steady amid mixed inflation signals',
    score: 78,
    framing: 'Neutral',
    tone: 'verified' as const,
  },
  {
    host: 'reuters.com',
    headline: 'Fed leaves rates unchanged as policymakers weigh inflation risks',
    score: 89,
    framing: 'Neutral',
    tone: 'verified' as const,
  },
  {
    host: 'wsj.com',
    headline: 'Fed Stands Pat. Wall Street Recalibrates.',
    score: 81,
    framing: 'Pro-market',
    tone: 'verified' as const,
  },
  {
    host: 'nytimes.com',
    headline: 'A cautious Fed signals the easy money era is over',
    score: 74,
    framing: 'Skeptical',
    tone: 'verified' as const,
  },
  {
    host: 'foxbusiness.com',
    headline: 'Powell holds the line as Trump pressure mounts',
    score: 52,
    framing: 'Political',
    tone: 'mixed' as const,
  },
  {
    host: 'breitbart.com',
    headline: 'Fed refuses to cut rates, ignoring families struggling with prices',
    score: 31,
    framing: 'Adversarial',
    tone: 'disputed' as const,
  },
  {
    host: 'cnbc.com',
    headline: 'Markets digest Fed pause; rate-cut odds slide to 24%',
    score: 84,
    framing: 'Pro-market',
    tone: 'verified' as const,
  },
  {
    host: 'theguardian.com',
    headline: 'US central bank holds rates as recession warnings grow',
    score: 71,
    framing: 'Skeptical',
    tone: 'verified' as const,
  },
]
