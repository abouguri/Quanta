'use client'

import { useState, useEffect } from 'react'
import type { ColorTheme } from '@/lib/colorTheme'
import { getColorTheme, saveColorTheme, resetColorTheme, DEFAULT_THEME } from '@/lib/colorTheme'
import { useTranslation } from '@/lib/i18n'

export function ColorThemeSettings() {
  const [theme, setTheme] = useState<ColorTheme>(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)
  const [saved, setSaved] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setTheme(getColorTheme())
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleChange = (key: keyof ColorTheme, value: number) => {
    setTheme(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    try {
      saveColorTheme(theme)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving theme')
    }
  }

  const handleReset = () => {
    if (confirm(t('settings.confirmReset'))) {
      resetColorTheme()
      setTheme(DEFAULT_THEME)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <h3 className="font-bold text-gray-900 dark:text-white">{t('settings.title')}</h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            {t('settings.reliableMin')}
            <span className="text-green-600 dark:text-green-400 ml-2">{theme.reliableMin}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={theme.reliableMin}
            onChange={(e) => handleChange('reliableMin', Math.min(parseInt(e.target.value), theme.moderateMin))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            {t('settings.moderateMin')}
            <span className="text-yellow-600 dark:text-yellow-400 ml-2">{theme.moderateMin}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={theme.moderateMin}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              const newVal = Math.max(val, theme.reliableMin - 1)
              handleChange('moderateMin', Math.min(newVal, theme.questionableMin))
            }}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 mb-1">
            {t('settings.questionableMin')}
            <span className="text-orange-600 dark:text-orange-400 ml-2">{theme.questionableMin}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={theme.questionableMin}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              const newVal = Math.max(val, theme.moderateMin - 1)
              handleChange('questionableMin', newVal)
            }}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
            saved
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
          }`}
        >
          {saved ? t('settings.saved') : t('settings.save')}
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
        >
          {t('settings.reset')}
        </button>
      </div>
    </div>
  )
}
