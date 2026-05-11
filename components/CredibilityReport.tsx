'use client'

import { AnalysisResult } from '@/types/analysis'

interface CredibilityReportProps {
  result: AnalysisResult
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 60) return 'bg-yellow-50 border-yellow-200'
  if (score >= 40) return 'bg-orange-50 border-orange-200'
  return 'bg-red-50 border-red-200'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Reliable'
  if (score >= 60) return 'Moderate'
  if (score >= 40) return 'Questionable'
  return 'High Risk'
}

export function CredibilityReport({ result }: CredibilityReportProps) {
  return (
    <div className="w-full space-y-8">
      {/* Main Score */}
      <div className={`border-l-4 p-6 rounded-none ${getScoreBg(result.overallScore)}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Credibility Analysis</h2>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}
            </div>
            <div className="text-sm text-gray-600 mt-1">{getScoreLabel(result.overallScore)}</div>
          </div>
        </div>
        <p className="text-gray-700 text-sm">
          This article scores {result.overallScore}/100 on credibility. 80-100 is reliable, 60-79 is moderate, 40-59 is questionable, and below 40 has high misinformation risk.
        </p>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fact Risk */}
        <div className="border border-gray-200 p-4 bg-white">
          <h3 className="font-bold text-gray-900 mb-2">Fact Risk</h3>
          <div className="mb-3">
            <div className="text-3xl font-bold text-gray-900">{result.factRiskScore}</div>
            <div className="text-xs text-gray-500">Higher = riskier</div>
          </div>
          <p className="text-sm text-gray-700">{result.breakdown.factRisk}</p>
        </div>

        {/* Bias Score */}
        <div className="border border-gray-200 p-4 bg-white">
          <h3 className="font-bold text-gray-900 mb-2">Bias Level</h3>
          <div className="mb-3">
            <div className="text-3xl font-bold text-gray-900">{result.biasScore}</div>
            <div className="text-xs text-gray-500">Higher = more biased</div>
          </div>
          <p className="text-sm text-gray-700">{result.breakdown.bias}</p>
        </div>

        {/* Sensationalism */}
        <div className="border border-gray-200 p-4 bg-white">
          <h3 className="font-bold text-gray-900 mb-2">Sensationalism</h3>
          <div className="mb-3">
            <div className="text-3xl font-bold text-gray-900">{result.sensationalismScore}</div>
            <div className="text-xs text-gray-500">Higher = more sensationalist</div>
          </div>
          <p className="text-sm text-gray-700">{result.breakdown.sensationalism}</p>
        </div>

        {/* Red Flags */}
        <div className="border border-gray-200 p-4 bg-white">
          <h3 className="font-bold text-gray-900 mb-2">Red Flags</h3>
          <div className="mb-3">
            <div className="text-3xl font-bold text-gray-900">{result.redFlags.length}</div>
            <div className="text-xs text-gray-500">Credibility warnings</div>
          </div>
          <p className="text-sm text-gray-700">
            {result.redFlags.length === 0
              ? 'No major red flags found'
              : `${result.redFlags.filter(f => f.severity === 'high').length} high, ${result.redFlags.filter(f => f.severity === 'medium').length} medium`}
          </p>
        </div>
      </div>

      {/* Red Flags Detail */}
      {result.redFlags.length > 0 && (
        <div className="border border-red-200 bg-red-50 p-4 space-y-3">
          <h3 className="font-bold text-gray-900">Warnings</h3>
          <div className="space-y-2">
            {result.redFlags.map((flag, index) => (
              <div key={index} className="text-sm">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      flag.severity === 'high'
                        ? 'bg-red-600'
                        : flag.severity === 'medium'
                          ? 'bg-orange-600'
                          : 'bg-yellow-600'
                    }`}
                  />
                  {flag.type}
                  <span className="text-xs text-gray-500">({flag.severity})</span>
                </div>
                <p className="text-gray-700 ml-4">{flag.description}</p>
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
        <div className="border-t border-gray-200 pt-4 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            {result.metadata.source && (
              <div>
                <span className="font-semibold text-gray-900">Source:</span> {result.metadata.source}
              </div>
            )}
            {result.metadata.author && (
              <div>
                <span className="font-semibold text-gray-900">Author:</span> {result.metadata.author}
              </div>
            )}
            {result.metadata.publishedDate && (
              <div>
                <span className="font-semibold text-gray-900">Published:</span>{' '}
                {result.metadata.publishedDate}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
