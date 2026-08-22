'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface AccountViewProps {
  email: string
  tier: 'free' | 'paid'
  subscriptionStatus: string | null
  renewsAt: string | null
  createdAt: string
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--ink)', background: 'var(--white)', marginTop: 24 }}>
      <div style={{ padding: '12px 22px', borderBottom: '1px solid var(--ghost)' }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
      <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--grey)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--ink)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export function AccountView({ email, tier, subscriptionStatus, renewsAt, createdAt }: AccountViewProps) {
  const { language, setLanguage } = useTranslation()
  const [busy, setBusy] = useState(false)

  const upgrade = async () => {
    setBusy(true)
    const res = await fetch('/api/checkout', { method: 'POST' })
    const body = await res.json().catch(() => ({})) as { url?: string }
    if (body.url) window.location.href = body.url
    else setBusy(false)
  }

  const manageBilling = async () => {
    setBusy(true)
    const res = await fetch('/api/billing-portal')
    const body = await res.json().catch(() => ({})) as { url?: string }
    if (body.url) window.location.href = body.url
    else setBusy(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bone)', padding: '80px 20px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: 8 }}>
          Account
        </div>
        <h1 style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 32, margin: '0 0 4px', color: 'var(--ink)', wordBreak: 'break-all' }}>
          {email}
        </h1>
        <div className="mono" style={{ fontSize: 12, color: 'var(--grey)' }}>
          Member since {new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
        </div>

        <Card label="Billing">
          <Row label="Plan" value={
            <span className="mono" style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: tier === 'paid' ? 'var(--verified)' : 'var(--ink)' }}>
              {tier === 'paid' ? 'Paid' : 'Free'}
            </span>
          } />
          {tier === 'paid' && subscriptionStatus && (
            <Row label="Status" value={`${subscriptionStatus}${renewsAt ? ` · renews ${new Date(renewsAt).toLocaleDateString()}` : ''}`} />
          )}
          <div style={{ padding: 22 }}>
            {tier === 'paid' ? (
              <button
                onClick={manageBilling}
                disabled={busy}
                className="mono"
                style={{ width: '100%', padding: '12px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--paper)', border: 0, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}
              >
                {busy ? 'Loading…' : 'Manage billing'}
              </button>
            ) : (
              <button
                onClick={upgrade}
                disabled={busy}
                className="mono"
                style={{ width: '100%', padding: '12px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--paper)', border: 0, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}
              >
                {busy ? 'Starting checkout…' : 'Upgrade'}
              </button>
            )}
          </div>
        </Card>

        <Card label="Preferences">
          <div style={{ padding: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--grey)' }}>Language</span>
            <div style={{ display: 'inline-flex', border: '1px solid var(--ghost)', borderRadius: 8, overflow: 'hidden' }}>
              {(['en', 'ar'] as const).map(code => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  aria-pressed={language === code}
                  className="mono"
                  style={{
                    padding: '8px 14px', fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer', border: 0,
                    background: language === code ? 'var(--ink)' : 'transparent',
                    color: language === code ? 'var(--paper)' : 'var(--ink)',
                  }}
                >
                  {code === 'en' ? 'English' : 'العربية'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card label="Session">
          <div style={{ padding: 22 }}>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="mono"
                style={{ width: '100%', padding: '12px', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', color: 'var(--unsupported)', border: '1px solid var(--unsupported)', cursor: 'pointer' }}
              >
                Sign out
              </button>
            </form>
          </div>
        </Card>

        <a href="/" style={{ display: 'inline-block', marginTop: 24, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey)' }}>
          ← Back to Quanta
        </a>
      </div>
    </div>
  )
}
