import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountView } from './account-view'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, tier, subscription_status, subscription_renews_at')
    .eq('id', user.id)
    .single()

  return (
    <AccountView
      email={profile?.email ?? user.email ?? ''}
      tier={profile?.tier ?? 'free'}
      subscriptionStatus={profile?.subscription_status ?? null}
      renewsAt={profile?.subscription_renews_at ?? null}
      createdAt={user.created_at}
    />
  )
}
