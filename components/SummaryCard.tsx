'use client'

import { useState, useEffect } from 'react'
import { SummaryResponse } from '@/types/summary'

interface SummaryCardProps {
  data: SummaryResponse
}

export function SummaryCard({ data }: SummaryCardProps) {
  const [visibleBullets, setVisibleBullets] = useState<number>(0)

  useEffect(() => {
    if (visibleBullets >= data.bullets.length) return

    const timer = setTimeout(() => {
      setVisibleBullets((prev) => prev + 1)
    }, 200)

    return () => clearTimeout(timer)
  }, [visibleBullets, data.bullets.length])

  return (
    <article className="w-full bg-white border-b border-gray-200 pb-6 animate-fadeInUp">
      {/* Headline */}
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3 leading-tight">
        {data.headline}
      </h2>

      {/* Meta information */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-4 border-b border-gray-100">
        <time>{data.freshness}</time>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">•</span>
          <span className="capitalize font-medium text-gray-700">{data.tone} coverage</span>
        </div>
      </div>

      {/* Key points */}
      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Key points</h3>
        {data.bullets.map((bullet, index) => (
          <div
            key={index}
            className={`text-gray-800 leading-relaxed transition-opacity duration-300 ${
              index < visibleBullets ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="font-bold text-gray-900 mr-2">{index + 1}.</span>
            {bullet}
          </div>
        ))}
      </div>

      {/* Summary box */}
      <div className="bg-gray-50 border-l-4 border-gray-400 px-4 py-3 mb-6">
        <p className="text-gray-800 text-sm leading-relaxed">{data.bottom_line}</p>
      </div>

      {/* Sources */}
      <div className="flex flex-wrap gap-3">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide self-center">Sources:</span>
        {data.sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-medium border-b border-transparent hover:border-gray-400 transition-colors"
            title={source.title}
          >
            {source.title}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </article>
  )
}

