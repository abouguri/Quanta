'use client'

interface CategoryChipsProps {
  onSelect: (category: string) => void
  disabled?: boolean
}

const CATEGORIES = [
  'Technology',
  'Politics',
  'Sports',
  'Science',
  'Business',
  'World',
]

export function CategoryChips({ onSelect, disabled = false }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm font-bold text-gray-600 uppercase tracking-wide self-center">Popular:</span>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          disabled={disabled}
          className="px-3 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {category}
        </button>
      ))}
    </div>
  )
}

