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
    '## Breakdown',
    `Fact Risk: ${result.factRiskScore}/100`,
    result.breakdown.factRisk,
    '',
    `Bias Level: ${result.biasScore}/100`,
    result.breakdown.bias,
    '',
    `Sensationalism: ${result.sensationalismScore}/100`,
    result.breakdown.sensationalism,
    '',
  ]

  if (result.redFlags.length > 0) {
    lines.push('## Red Flags')
    result.redFlags.forEach(flag => {
      lines.push(`[${flag.severity.toUpperCase()}] ${flag.type}`)
      lines.push(`  ${flag.description}`)
    })
    lines.push('')
  }

  if (result.metadata.source || result.metadata.author || result.metadata.publishedDate) {
    lines.push('## Metadata')
    if (result.metadata.source) lines.push(`Source: ${result.metadata.source}`)
    if (result.metadata.author) lines.push(`Author: ${result.metadata.author}`)
    if (result.metadata.publishedDate) lines.push(`Published: ${result.metadata.publishedDate}`)
  }

  return lines.join('\n')
}
