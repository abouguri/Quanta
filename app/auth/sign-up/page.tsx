'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'submitting' | 'check-email' | 'error'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (signUpError) {
      setError(signUpError.message)
      setStatus('error')
      return
    }
    // Supabase's default project setting requires email confirmation before a
    // session exists — the row lands in auth.users either way, so the
    // on_auth_user_created trigger has already created a free-tier profile.
    setStatus('check-email')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bone)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, border: '1px solid var(--ink)', background: 'var(--white)' }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--ghost)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)' }}>
          Create an account
        </div>

        {status === 'check-email' ? (
          <div style={{ padding: '28px 22px' }}>
            <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 16, lineHeight: 1.5, color: 'var(--ink)' }}>
              Check <strong>{email}</strong> to confirm your account.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ padding: '22px', display: 'grid', gap: 14 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--grey)' }}>Email</span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ border: '1px solid var(--ghost)', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 14, background: 'transparent', color: 'var(--ink)' }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--grey)' }}>Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ border: '1px solid var(--ghost)', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 14, background: 'transparent', color: 'var(--ink)' }}
              />
            </label>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--unsupported)' }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                background: 'var(--ink)', color: 'var(--paper)', padding: '12px', border: 0,
                fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: status === 'submitting' ? 'not-allowed' : 'pointer', opacity: status === 'submitting' ? 0.6 : 1,
              }}
            >
              {status === 'submitting' ? 'Creating account…' : 'Sign up'}
            </button>

            <div style={{ fontSize: 13, color: 'var(--grey)', paddingTop: 6, borderTop: '1px solid var(--ghost)' }}>
              Already have an account? <Link href="/auth/sign-in" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
