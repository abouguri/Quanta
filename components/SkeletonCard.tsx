'use client'

export function SkeletonCard() {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      </div>
      <div className="flex gap-2 pt-4">
        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
        <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
      </div>
    </div>
  )
}
