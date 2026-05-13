import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { TranslationProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'FactNews — Editorial Forensics',
  description: 'An instrument for reading news with both eyes open. Four-pass AI review of credibility, bias, and misinformation risk.',
  keywords: ['news', 'credibility', 'misinformation', 'bias', 'ai', 'fact-check'],
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
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
