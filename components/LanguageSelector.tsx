'use client'

import { useTranslation } from '@/lib/i18n'

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'ar'
            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        العربية
      </button>
    </div>
  )
}
