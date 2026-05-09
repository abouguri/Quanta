'use client'

import { useState, useEffect } from 'react'
import { SummaryResponse } from '@/types/summary'

interface SummaryCardProps {
  data: SummaryResponse
}

const TONE_COLORS = {
  neutral: 'bg-green-100 text-green-800',
  mixed: 'bg-amber-100 text-amber-800',
  heated: 'bg-red-100 text-red-800',
}

export function SummaryCard({ data }: SummaryCardProps) {
  const [visibleBullets, setVisibleBullets] = useState<number>(0)

  useEffect(() => {
    if (visibleBullets >= data.bullets.length) return

    const timer = setTimeout(() => {
      setVisibleBullets((prev) => prev + 1)
    }, 300)

    return () => clearTimeout(timer)
  }, [visibleBullets, data.bullets.length])

  const toneColor = TONE_COLORS[data.tone] || TONE_COLORS.neutral

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
      {/* Headline */}
      <div className="animate-fadeInUp">
        <h2 className="text-2xl font-bold text-gray-900">{data.headline}</h2>
      </div>

      {/* Tone Badge & Freshness */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${toneColor}`}
        >
          {data.tone}
        </span>
        <span className="text-sm text-gray-500">Sourced {data.freshness}</span>
      </div>

      {/* Bullets */}
      <div className="space-y-2">
        {data.bullets.map((bullet, index) => (
          <div
            key={index}
            className={`text-gray-700 pl-4 border-l-2 border-blue-400 transition-opacity duration-500 ${
              index < visibleBullets ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              animation:
                index < visibleBullets ? 'fadeInUp 0.5s ease-out forwards' : 'none',
            }}
          >
            • {bullet}
          </div>
        ))}
      </div>

      {/* Bottom Line */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <p className="text-sm text-gray-700 italic">{data.bottom_line}</p>
      </div>

      {/* Sources */}
      <div className="flex flex-wrap gap-2 pt-2">
        {data.sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-xs font-medium transition-colors"
            title={source.title}
          >
            {source.title}
          </a>
        ))}
      </div>
    </div>
  )
}
