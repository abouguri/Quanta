import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckout, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

/**
 * Starts a Lemon Squeezy checkout for the signed-in user. The Supabase user
 * id rides along as `checkoutData.custom.user_id` — Lemon Squeezy echoes it
 * back as `meta.custom_data.user_id` on every subsequent webhook for this
 * checkout, which is how the webhook maps an LS subscription back to a
 * Supabase user without asking LS to know anything about our accounts.
 */
export async function POST(): Promise<Response> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID
  if (!apiKey || !storeId || !variantId) {
    console.error('Lemon Squeezy is not configured (missing API key, store id, or variant id).')
    return NextResponse.json({ error: 'Billing is not available right now.' }, { status: 503 })
  }

  lemonSqueezySetup({ apiKey })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://factnews-six.vercel.app'
  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email,
      custom: { user_id: user.id },
    },
    productOptions: {
      redirectUrl: `${siteUrl}/account?upgraded=1`,
    },
  })

  if (error || !data) {
    console.error('Lemon Squeezy checkout creation failed:', error?.message)
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 502 })
  }

  return NextResponse.json({ url: data.data.attributes.url })
}
