import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string
    custom_data?: { user_id?: string }
  }
  data: {
    attributes: {
      status: string
      customer_id: number
      renews_at: string | null
    }
    id: string
  }
}

const ACTIVE_STATUSES = new Set(['active', 'on_trial', 'past_due'])

/**
 * Verifies the raw body against X-Signature before anything else touches it —
 * signature verification is over raw bytes, so parsing JSON first would
 * already be too late to matter. Uses timingSafeEqual rather than `===` so
 * comparing signatures can't leak timing information about how much of the
 * expected signature an attacker's guess matched.
 */
function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const actualBuffer = Buffer.from(signatureHeader, 'utf8')
  if (expectedBuffer.length !== actualBuffer.length) return false
  return timingSafeEqual(expectedBuffer, actualBuffer)
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set — rejecting all webhook deliveries.')
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 })
  }

  const rawBody = await request.text()
  if (!isValidSignature(rawBody, request.headers.get('X-Signature'), secret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  let payload: LemonSqueezyWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Malformed payload.' }, { status: 400 })
  }

  const eventName = payload.meta.event_name
  const userId = payload.meta.custom_data?.user_id

  const SUBSCRIPTION_EVENTS = new Set([
    'subscription_created',
    'subscription_updated',
    'subscription_cancelled',
    'subscription_expired',
  ])
  if (!SUBSCRIPTION_EVENTS.has(eventName)) {
    // Acknowledge and ignore — Lemon Squeezy retries on a non-2xx response,
    // and order_created / other events we don't act on don't need that.
    return NextResponse.json({ ok: true })
  }

  if (!userId) {
    // A checkout LS created without our custom_data (e.g. one built by hand
    // in the LS dashboard rather than through /api/checkout). Nothing to map
    // this to — ack so LS doesn't retry, but don't guess which user it was.
    console.error(`Lemon Squeezy webhook "${eventName}" arrived with no custom_data.user_id.`)
    return NextResponse.json({ ok: true })
  }

  const { status, customer_id, renews_at } = payload.data.attributes
  const subscriptionId = payload.data.id

  const update =
    eventName === 'subscription_expired'
      ? { tier: 'free' as const, subscription_status: 'expired' }
      : eventName === 'subscription_cancelled'
        // LS subscriptions stay active through the period already paid for —
        // cancellation alone doesn't end access, subscription_expired does.
        ? { subscription_status: 'cancelled' }
        : {
            tier: ACTIVE_STATUSES.has(status) ? ('paid' as const) : ('free' as const),
            subscription_status: status,
            lemonsqueezy_customer_id: String(customer_id),
            lemonsqueezy_subscription_id: subscriptionId,
            subscription_renews_at: renews_at,
          }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('profiles')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Failed to apply Lemon Squeezy webhook to profiles:', error.message)
    // A 500 makes LS retry, which is what we want for a transient DB error.
    return NextResponse.json({ error: 'Could not update subscription.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
