'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Mode = 'password' | 'magic-link'
type Status = 'idle' | 'submitting' | 'magic-link-sent' | 'error'

export default function SignInPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setError('')
    const supabase = createClient()

    if (mode === 'password') {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        setStatus('error')
        return
      }
      router.push('/')
      router.refresh()
      return
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (otpError) {
      setError(otpError.message)
      setStatus('error')
      return
    }
    setStatus('magic-link-sent')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bone)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, border: '1px solid var(--ink)', background: 'var(--white)' }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--ghost)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--grey)' }}>
          Sign in
        </div>

        {status === 'magic-link-sent' ? (
          <div style={{ padding: '28px 22px' }}>
            <p style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: 16, lineHeight: 1.5, color: 'var(--ink)' }}>
              Check <strong>{email}</strong> for a sign-in link.
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

            {mode === 'password' && (
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--grey)' }}>Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ border: '1px solid var(--ghost)', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 14, background: 'transparent', color: 'var(--ink)' }}
                />
              </label>
            )}

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
              {status === 'submitting' ? 'Signing in…' : mode === 'password' ? 'Sign in' : 'Send magic link'}
            </button>

            <button
              type="button"
              onClick={() => { setMode(mode === 'password' ? 'magic-link' : 'password'); setError(''); setStatus('idle') }}
              style={{ background: 'transparent', border: 0, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--grey)', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              {mode === 'password' ? 'Send a magic link instead' : 'Use a password instead'}
            </button>

            <div style={{ fontSize: 13, color: 'var(--grey)', paddingTop: 6, borderTop: '1px solid var(--ghost)' }}>
              No account? <Link href="/auth/sign-up" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>Sign up</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
