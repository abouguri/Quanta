import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSubscription, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

/** Returns a fresh Lemon Squeezy customer-portal URL for the signed-in user's subscription. */
export async function GET(): Promise<Response> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('lemonsqueezy_subscription_id')
    .eq('id', user.id)
    .single()

  if (!profile?.lemonsqueezy_subscription_id) {
    return NextResponse.json({ error: 'No subscription on file.' }, { status: 404 })
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Billing is not available right now.' }, { status: 503 })
  }
  lemonSqueezySetup({ apiKey })

  const { data, error } = await getSubscription(profile.lemonsqueezy_subscription_id)
  if (error || !data) {
    return NextResponse.json({ error: 'Could not load billing portal.' }, { status: 502 })
  }

  return NextResponse.json({ url: data.data.attributes.urls.customer_portal })
}
