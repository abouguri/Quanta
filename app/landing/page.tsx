'use client'

import { MarketingHero } from '@/components/marketing/Hero'
import { TrustStrip, HowItWorks, ComparePreview, Methodology, QuoteStrip, CTAFooter } from '@/components/marketing/Sections'
import { COLORS, FONTS, SPACING } from '@/lib/marketing-constants'

export default function LandingPage() {
  const handleAnalyzeUrl = (url: string) => {
    console.log('Analyzing URL:', url)
    // TODO: Connect to real analysis endpoint
    // This would typically redirect to the product page with the URL
  }

  return (
    <div
      style={{
        background: COLORS.bone,
        color: COLORS['ink-navy'],
        fontFamily: FONTS.sans,
        fontSize: '16px',
        lineHeight: 1.6,
        '-webkit-font-smoothing': 'antialiased',
        'text-rendering': 'optimizeLegibility',
      } as React.CSSProperties}
    >
      {/* Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: `color-mix(in oklab, ${COLORS.bone} 88%, transparent)`,
        backdropFilter: 'saturate(140%) blur(8px)',
        borderBottom: `0.5px solid ${COLORS.fog}`,
      }}>
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: `14px ${SPACING[10]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a href="#top" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <rect width="64" height="64" rx="14" fill={COLORS['ink-navy']} />
              <circle cx="29" cy="30" r="14" stroke={COLORS.bone} strokeWidth="3.2" fill="none" />
              <circle cx="43" cy="42" r="3.4" fill={COLORS.ember} />
            </svg>
            <span style={{ fontFamily: FONTS.sans, fontSize: '22px', fontWeight: 500, letterSpacing: '-0.025em' }}>
              Quanta<span style={{ color: COLORS.ember }}>.</span>
            </span>
          </a>

          <nav style={{ display: 'flex', alignItems: 'center', gap: SPACING[8], fontFamily: FONTS.sans, fontSize: '14px', fontWeight: 500 }}>
            {['How it works', 'Methodology', 'Pricing', 'For teams', 'API'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '')}`}
                style={{
                  color: COLORS['ink-navy'],
                  textDecoration: 'none',
                  padding: '4px 0',
                }}
              >
                {link}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a href="#" style={{ fontSize: '14px', fontWeight: 500, color: COLORS['ink-navy'], textDecoration: 'none' }}>
              Sign in
            </a>
            <a
              href="/api/auth/signin"
              style={{
                background: COLORS['ink-navy'],
                color: COLORS.bone,
                padding: '12px 22px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Install extension
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="top">
        <MarketingHero onAnalyzeUrl={handleAnalyzeUrl} />
        <TrustStrip />
        <HowItWorks />
        <ComparePreview />
        <Methodology />
        <QuoteStrip />
        <CTAFooter />
      </main>

      {/* Global animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes qfill {
          from { width: 0; }
          to { width: var(--q-w, 0%); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        a:hover { text-decoration: underline; text-decoration-thickness: 0.5px; text-underline-offset: 4px; }
      `}</style>
    </div>
  )
}
