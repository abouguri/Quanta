'use client'

import { AnalysisResult } from '@/types/analysis'
import { useTranslation } from '@/lib/i18n'

interface CredibilityReportProps {
  result: AnalysisResult
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
  if (score >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
  if (score >= 40) return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
  return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
}

function getScoreLabelKey(score: number): string {
  if (score >= 80) return 'report.reliable'
  if (score >= 60) return 'report.moderate'
  if (score >= 40) return 'report.questionable'
  return 'report.highRisk'
}

export function CredibilityReport({ result }: CredibilityReportProps) {
  const { t } = useTranslation()
  
  return (
    <div className="w-full space-y-8">
      {/* Main Score */}
      <div className={`border-l-4 p-6 rounded-none ${getScoreBg(result.overallScore)}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('report.title')}</h2>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t(getScoreLabelKey(result.overallScore))}</div>
          </div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {t('report.scoreExplanation', { score: result.overallScore })}
        </p>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fact Risk */}
        <div className="border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('report.factRisk')}</h3>
          <div className="mb-3">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{result.factRiskScore}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('report.factRiskHint')}</div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{result.breakdown.factRisk}</p>
        </div>

        {/* Bias Score */}
        <div className="border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('report.bias')}</h3>
          <div className="mb-3">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{result.biasScore}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('report.biasHint')}</div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{result.breakdown.bias}</p>
        </div>

        {/* Sensationalism */}
        <div className="border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('report.sensationalism')}</h3>
          <div className="mb-3">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{result.sensationalismScore}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('report.sensationalismHint')}</div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{result.breakdown.sensationalism}</p>
        </div>

        {/* Red Flags */}
        <div className="border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('report.redFlags')}</h3>
          <div className="mb-3">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{result.redFlags.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('report.redFlagsHint')}</div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {result.redFlags.length === 0
              ? t('report.noRedFlags')
              : `${result.redFlags.filter(f => f.severity === 'high').length} ${t('report.severityHigh')}, ${result.redFlags.filter(f => f.severity === 'medium').length} ${t('report.severityMedium')}`}
          </p>
        </div>
      </div>

      {/* Red Flags Detail */}
      {result.redFlags.length > 0 && (
        <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">{t('report.warnings')}</h3>
          <div className="space-y-2">
            {result.redFlags.map((flag, index) => (
              <div key={index} className="text-sm">
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      flag.severity === 'high'
                        ? 'bg-red-600 dark:bg-red-400'
                        : flag.severity === 'medium'
                          ? 'bg-orange-600 dark:bg-orange-400'
                          : 'bg-yellow-600 dark:bg-yellow-400'
                    }`}
                  />
                  {flag.type}
                  <span className="text-xs text-gray-500 dark:text-gray-400">({t(`report.severity${flag.severity.charAt(0).toUpperCase() + flag.severity.slice(1)}`)})</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 ml-4">{flag.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {(result.metadata.title ||
        result.metadata.source ||
        result.metadata.author ||
        result.metadata.publishedDate) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="grid grid-cols-2 gap-4">
            {result.metadata.source && (
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">{t('report.source')}:</span> {result.metadata.source}
              </div>
            )}
            {result.metadata.author && (
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">{t('report.author')}:</span> {result.metadata.author}
              </div>
            )}
            {result.metadata.publishedDate && (
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">{t('report.published')}:</span>{' '}
                {result.metadata.publishedDate}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
