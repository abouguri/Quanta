'use client'

export function SkeletonCard() {
  return (
    <article className="w-full bg-white border-b border-gray-200 pb-6">
      {/* Headline skeleton */}
      <div className="h-10 bg-gray-200 rounded-none animate-pulse w-4/5 mb-3" />
      
      {/* Meta skeleton */}
      <div className="flex gap-4 mb-6 pb-4 border-b border-gray-100">
        <div className="h-4 bg-gray-200 rounded-none animate-pulse w-32" />
        <div className="h-4 bg-gray-200 rounded-none animate-pulse w-24" />
      </div>

      {/* Key points skeleton */}
      <div className="mb-6 space-y-3">
        <div className="h-4 bg-gray-200 rounded-none animate-pulse w-20" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-none animate-pulse w-full" />
            <div className="h-4 bg-gray-200 rounded-none animate-pulse w-5/6" />
          </div>
        ))}
      </div>

      {/* Summary box skeleton */}
      <div className="bg-gray-50 border-l-4 border-gray-200 px-4 py-3 mb-6 space-y-2">
        <div className="h-4 bg-gray-200 rounded-none animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded-none animate-pulse w-4/5" />
      </div>

      {/* Sources skeleton */}
      <div className="flex gap-3">
        <div className="h-4 bg-gray-200 rounded-none animate-pulse w-16" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded-none animate-pulse w-24" />
        ))}
      </div>
    </article>
  )
}

