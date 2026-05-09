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
    <div className="flex flex-wrap gap-2 justify-center">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          disabled={disabled}
          className="px-4 py-2 rounded-full bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          {category}
        </button>
      ))}
    </div>
  )
}
