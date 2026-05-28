import { AnalysisResult } from '@/types/analysis'

export async function copyResultsToClipboard(result: AnalysisResult): Promise<boolean> {
  try {
    const text = formatResultsAsText(result)
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function formatResultsAsText(result: AnalysisResult): string {
  const lines = [
    '# Credibility Analysis Report',
    '',
    `Overall Score: ${result.overallScore}/100`,
    result.overallScore >= 80 ? '✓ Reliable' : result.overallScore >= 60 ? '⚠ Moderate' : result.overallScore >= 40 ? '⚠ Questionable' : '✗ High Risk',
    '',
    '## Structural Analysis',
    `Structural Score: ${result.structural.score}/100`,
  ]

  if (result.structural.flags.length > 0) {
    lines.push('')
    lines.push('### Structural Flags')
    result.structural.flags.forEach(flag => {
      lines.push(`[${flag.severity.toUpperCase()}] ${flag.type}`)
      lines.push(`  ${flag.description}`)
    })
  }

  if (result.claims && result.claims.length > 0) {
    lines.push('')
    lines.push('## Claim Verification')
    result.claims.forEach((c, i) => {
      lines.push('')
      lines.push(`### Claim ${i + 1} — ${c.verdict}`)
      lines.push(`"${c.claim.text}"`)
      lines.push(c.summary)
      if (c.factCheckUrl) lines.push(`Source: ${c.factCheckUrl}`)
    })
  }

  if (result.metadata.source || result.metadata.author || result.metadata.publishedDate) {
    lines.push('')
    lines.push('## Metadata')
    if (result.metadata.source) lines.push(`Source: ${result.metadata.source}`)
    if (result.metadata.author) lines.push(`Author: ${result.metadata.author}`)
    if (result.metadata.publishedDate) lines.push(`Published: ${result.metadata.publishedDate}`)
  }

  return lines.join('\n')
}
