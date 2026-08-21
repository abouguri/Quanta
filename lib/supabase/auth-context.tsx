'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from './client'
import { isSupabaseConfigured } from './config'

export interface Profile {
  id: string
  email: string
  tier: 'free' | 'paid'
  subscription_status: string | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Accounts are opt-in infrastructure: until Supabase is configured, every
    // visitor is just signed-out, same as today — never a crash.
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    const loadProfile = async (currentUser: User | null) => {
      if (!currentUser) {
        setProfile(null)
        return
      }
      // Every signed-in user gets a profile row via the on_auth_user_created
      // trigger, so a miss here means the row hasn't landed yet — not a
      // reason to treat the session as invalid.
      const { data } = await supabase
        .from('profiles')
        .select('id, email, tier, subscription_status')
        .eq('id', currentUser.id)
        .single()
      setProfile(data as Profile | null)
    }

    supabase.auth.getUser().then(({ data: { user: initialUser } }) => {
      setUser(initialUser)
      void loadProfile(initialUser).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      void loadProfile(nextUser)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
