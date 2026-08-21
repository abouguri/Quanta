import { createHmac } from 'crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const update = vi.hoisted(() => vi.fn())
const eq = vi.hoisted(() => vi.fn())
const from = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from }),
}))

import { POST } from '../route'

const SECRET = 'test-webhook-secret'

function sign(body: string): string {
  return createHmac('sha256', SECRET).update(body).digest('hex')
}

function webhookRequest(body: unknown, options: { signature?: string; raw?: string } = {}): Request {
  const bodyText = options.raw ?? JSON.stringify(body)
  return new Request('https://quanta.test/api/webhooks/lemonsqueezy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Signature': options.signature ?? sign(bodyText) },
    body: bodyText,
  })
}

function subscriptionPayload(eventName: string, overrides: Record<string, unknown> = {}) {
  return {
    meta: { event_name: eventName, custom_data: { user_id: 'user-abc' } },
    data: {
      id: 'sub-123',
      attributes: { status: 'active', customer_id: 555, renews_at: '2026-09-01T00:00:00.000Z', ...overrides },
    },
  }
}

describe('POST /api/webhooks/lemonsqueezy', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = SECRET
    update.mockReset().mockReturnValue({ eq })
    eq.mockReset().mockResolvedValue({ error: null })
    from.mockReset().mockReturnValue({ update })
  })

  it('rejects a tampered body with 401 and never touches the database', async () => {
    const body = JSON.stringify(subscriptionPayload('subscription_created'))
    const response = await POST(webhookRequest(null, { raw: body, signature: sign('a different body') }))

    expect(response.status).toBe(401)
    expect(from).not.toHaveBeenCalled()
  })

  it('rejects a missing signature', async () => {
    const response = await POST(webhookRequest(subscriptionPayload('subscription_created'), { signature: '' }))
    expect(response.status).toBe(401)
  })

  it('rejects when the webhook secret is not configured', async () => {
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    const response = await POST(webhookRequest(subscriptionPayload('subscription_created')))
    expect(response.status).toBe(503)
    expect(from).not.toHaveBeenCalled()
  })

  it('subscription_created with an active status sets tier to paid', async () => {
    const response = await POST(webhookRequest(subscriptionPayload('subscription_created', { status: 'active' })))

    expect(response.status).toBe(200)
    expect(from).toHaveBeenCalledWith('profiles')
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      tier: 'paid',
      subscription_status: 'active',
      lemonsqueezy_customer_id: '555',
      lemonsqueezy_subscription_id: 'sub-123',
    }))
    expect(eq).toHaveBeenCalledWith('id', 'user-abc')
  })

  it('subscription_created with a non-active status (e.g. unpaid) does not grant paid tier', async () => {
    await POST(webhookRequest(subscriptionPayload('subscription_created', { status: 'unpaid' })))
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ tier: 'free', subscription_status: 'unpaid' }))
  })

  it('subscription_cancelled records the status but does not downgrade tier yet', async () => {
    await POST(webhookRequest(subscriptionPayload('subscription_cancelled')))

    const [written] = update.mock.calls[0]
    expect(written).toEqual(expect.objectContaining({ subscription_status: 'cancelled' }))
    expect(written).not.toHaveProperty('tier')
  })

  it('subscription_expired downgrades to free', async () => {
    await POST(webhookRequest(subscriptionPayload('subscription_expired')))
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ tier: 'free', subscription_status: 'expired' }))
  })

  it('acknowledges and ignores an event type it does not act on', async () => {
    const response = await POST(webhookRequest({ meta: { event_name: 'order_created', custom_data: { user_id: 'user-abc' } }, data: { id: 'x', attributes: {} } }))

    expect(response.status).toBe(200)
    expect(from).not.toHaveBeenCalled()
  })

  it('acknowledges without writing when custom_data.user_id is missing', async () => {
    const payload = subscriptionPayload('subscription_created')
    // @ts-expect-error deliberately dropping custom_data for this case
    delete payload.meta.custom_data
    const response = await POST(webhookRequest(payload))

    expect(response.status).toBe(200)
    expect(from).not.toHaveBeenCalled()
  })

  it('a database error on write surfaces as a 500 so Lemon Squeezy retries', async () => {
    eq.mockResolvedValue({ error: new Error('connection reset') })
    const response = await POST(webhookRequest(subscriptionPayload('subscription_created')))
    expect(response.status).toBe(500)
  })

  it('rejects a malformed JSON body even with a valid signature over it', async () => {
    const raw = 'not json'
    const response = await POST(webhookRequest(null, { raw, signature: sign(raw) }))
    expect(response.status).toBe(400)
  })
})
