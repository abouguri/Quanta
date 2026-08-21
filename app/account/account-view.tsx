'use client'

import { useState } from 'react'

interface AccountViewProps {
  email: string
  tier: 'free' | 'paid'
  subscriptionStatus: string | null
  renewsAt: string | null
}

export function AccountView({ email, tier, subscriptionStatus, renewsAt }: AccountViewProps) {
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
        <h1 style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 32, margin: '0 0 28px', color: 'var(--ink)' }}>
          {email}
        </h1>

        <div style={{ border: '1px solid var(--ink)', background: 'var(--white)' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--grey)' }}>Plan</span>
            <span className="mono" style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: tier === 'paid' ? 'var(--verified)' : 'var(--ink)' }}>
              {tier === 'paid' ? 'Paid' : 'Free'}
            </span>
          </div>

          {tier === 'paid' && subscriptionStatus && (
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--ghost)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--grey)' }}>Status</span>
              <span style={{ fontSize: 14, color: 'var(--ink)' }}>
                {subscriptionStatus}{renewsAt ? ` · renews ${new Date(renewsAt).toLocaleDateString()}` : ''}
              </span>
            </div>
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
        </div>

        <a href="/" style={{ display: 'inline-block', marginTop: 20, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey)' }}>
          ← Back to Quanta
        </a>
      </div>
    </div>
  )
}
