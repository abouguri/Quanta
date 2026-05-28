import { StructuralAnalysis, StructuralFlag } from '@/types/analysis'

const SUSPICIOUS_TLDS = new Set([
  '.xyz', '.info', '.biz', '.click', '.online', '.site', '.top',
  '.club', '.win', '.loan', '.work', '.review', '.date', '.stream',
])

const SEVERITY_PENALTY: Record<'high' | 'medium' | 'low', number> = {
  high: 20,
  medium: 10,
  low: 5,
}

export function analyzeStructure(
  articleText: string,
  metadata: { title?: string; source?: string; author?: string; publishedDate?: string },
): StructuralAnalysis {
  const flags: StructuralFlag[] = []

  const hasAuthor = Boolean(metadata.author && metadata.author.trim().length >= 2)
  if (!hasAuthor) {
    flags.push({ type: 'No author attribution', severity: 'high', description: 'Article has no byline or author credit.' })
  }

  const hasDate = Boolean(metadata.publishedDate && metadata.publishedDate.trim().length >= 4)
  if (!hasDate) {
    flags.push({ type: 'No publish date', severity: 'medium', description: 'No publication date found — impossible to judge timeliness.' })
  }

  const domain = metadata.source || ''
  const tld = domain.includes('.') ? '.' + domain.split('.').pop()!.toLowerCase() : ''
  const suspiciousDomain = SUSPICIOUS_TLDS.has(tld)
  if (suspiciousDomain) {
    flags.push({ type: 'Suspicious domain', severity: 'high', description: `Domain uses a TLD commonly associated with low-credibility sites (${tld}).` })
  }

  const words = articleText.split(/\s+/).filter(w => w.length > 3)
  const capsWords = words.filter(w => /[A-Z]{2,}/.test(w) && w === w.toUpperCase())
  const capsRatio = words.length > 0 ? capsWords.length / words.length : 0
  if (capsRatio > 0.15) {
    flags.push({ type: 'Excessive all-caps', severity: 'high', description: `${Math.round(capsRatio * 100)}% of words are in ALL CAPS.` })
  } else if (capsRatio > 0.05) {
    flags.push({ type: 'Elevated all-caps', severity: 'medium', description: `${Math.round(capsRatio * 100)}% of words are in ALL CAPS — above normal.` })
  }

  const sentences = articleText.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const exclamationCount = (articleText.match(/!/g) || []).length
  const exclamationDensity = sentences.length > 0 ? exclamationCount / sentences.length : 0
  if (exclamationDensity > 0.2) {
    flags.push({ type: 'Exclamation overuse', severity: 'medium', description: 'Unusually high frequency of exclamation marks — common in sensationalist writing.' })
  } else if (exclamationDensity > 0.08) {
    flags.push({ type: 'Elevated exclamations', severity: 'low', description: 'Above-average use of exclamation marks.' })
  }

  if (articleText.trim().length < 300) {
    flags.push({ type: 'Very short content', severity: 'medium', description: 'Article is very short and likely lacks sufficient context.' })
  }

  const totalPenalty = flags.reduce((acc, f) => acc + SEVERITY_PENALTY[f.severity], 0)
  const score = Math.max(0, Math.min(100, 100 - totalPenalty))

  return {
    score,
    flags,
    metrics: {
      hasAuthor,
      hasDate,
      capsRatio,
      exclamationDensity,
      suspiciousDomain,
      articleLength: articleText.trim().length,
    },
  }
}
