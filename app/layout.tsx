import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { TranslationProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'FactNews — News Credibility Analyzer',
  description:
    'Analyze news articles for credibility, bias, and misinformation risk. Get a bullshit meter score powered by AI.',
  keywords: [
    'news',
    'credibility',
    'misinformation',
    'bias',
    'ai',
    'fact-check',
  ],
  authors: [{ name: 'FactNews' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
