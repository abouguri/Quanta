'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSubmit: (topic: string) => void
  disabled?: boolean
}

export function SearchBar({ onSubmit, disabled = false }: SearchBarProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed && trimmed.length <= 200) {
      onSubmit(trimmed)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search news topics..."
          disabled={disabled}
          maxLength={200}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={disabled}
          className="px-6 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed rounded-none"
        >
          {disabled ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  )
}
