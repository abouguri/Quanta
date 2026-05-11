export interface ColorTheme {
  reliableMin: number  // >= this = green (reliable)
  moderateMin: number  // >= this = yellow (moderate)
  questionableMin: number // >= this = orange (questionable)
  // < questionableMin = red (high risk)
}

export const DEFAULT_THEME: ColorTheme = {
  reliableMin: 80,
  moderateMin: 60,
  questionableMin: 40,
}

const THEME_KEY = 'factnews_color_theme'

export function getColorTheme(): ColorTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME

  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (!stored) return DEFAULT_THEME
    const parsed = JSON.parse(stored)
    // Validate
    if (parsed.reliableMin > parsed.moderateMin || parsed.moderateMin > parsed.questionableMin) {
      return DEFAULT_THEME
    }
    return parsed
  } catch {
    return DEFAULT_THEME
  }
}

export function saveColorTheme(theme: ColorTheme): void {
  if (typeof window === 'undefined') return

  // Validate
  if (theme.reliableMin > theme.moderateMin || theme.moderateMin > theme.questionableMin) {
    throw new Error('Invalid thresholds: reliable > moderate > questionable')
  }

  localStorage.setItem(THEME_KEY, JSON.stringify(theme))
}

export function resetColorTheme(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(THEME_KEY)
}

export function getScoreLabel(score: number, theme: ColorTheme = DEFAULT_THEME): 'reliable' | 'moderate' | 'questionable' | 'highRisk' {
  if (score >= theme.reliableMin) return 'reliable'
  if (score >= theme.moderateMin) return 'moderate'
  if (score >= theme.questionableMin) return 'questionable'
  return 'highRisk'
}
