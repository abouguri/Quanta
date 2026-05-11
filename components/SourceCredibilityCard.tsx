'use client'

import { getSourceCredibility, getCredibilityLabel, getBiasLabel } from '@/lib/sourceDatabase'
import { useTranslation } from '@/lib/i18n'

interface SourceCredibilityCardProps {
  url?: string
}

export function SourceCredibilityCard({ url }: SourceCredibilityCardProps) {
  const { t } = useTranslation()

  if (!url) return null

  const sourceCredibility = getSourceCredibility(url)
  const credibilityLabel = getCredibilityLabel(sourceCredibility.credibilityScore)
  const biasLabel = getBiasLabel(sourceCredibility.bias)

  const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
      green: 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-200',
      blue: 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200',
      yellow: 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200',
      orange: 'border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-200',
      red: 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200',
    }
    return map[color] || map.blue
  }

  const colorClasses = getColorClasses(credibilityLabel.color)

  return (
    <div className={`border-l-4 ${colorClasses} p-4 rounded-none mb-6`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-sm text-gray-700 dark:text-gray-300">{t('source.title') || 'Source Credibility'}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{sourceCredibility.name}</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${credibilityLabel.textColor}`}>{sourceCredibility.credibilityScore}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">/ 100</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {t('source.credibilityLevel') || 'Credibility Level'}
          </p>
          <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${credibilityLabel.textColor}`}>
            {credibilityLabel.label}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {t('source.bias') || 'Editorial Bias'}
          </p>
          <p className={`text-sm font-medium ${biasLabel.color}`}>
            {biasLabel.label}
          </p>
        </div>

        {sourceCredibility.factCheckerRating && (
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              {t('source.rating') || 'Fact-Checker Rating'}
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-300">
              {sourceCredibility.factCheckerRating}
            </p>
          </div>
        )}

        {sourceCredibility.strengths && sourceCredibility.strengths.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              {t('source.strengths') || 'Strengths'}
            </p>
            <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
              {sourceCredibility.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">+</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {sourceCredibility.notableIssues && sourceCredibility.notableIssues.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              {t('source.issues') || 'Notable Issues'}
            </p>
            <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
              {sourceCredibility.notableIssues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">!</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
