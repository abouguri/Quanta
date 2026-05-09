import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FactNews — Real-time news summaries',
  description:
    'Get real-time news summaries on any topic powered by Grok API with live web search.',
  keywords: [
    'news',
    'summarizer',
    'real-time',
    'grok',
    'ai',
    'current events',
  ],
  authors: [{ name: 'FactNews' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
