import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * The service-role Supabase client. Bypasses Row Level Security entirely, so
 * it is the only client allowed to write `profiles.tier` and the subscription
 * columns — mirroring the same principle the analyze route already applies to
 * tier resolution: never trust a client-supplied value, only a trusted
 * server-side path.
 *
 * Import this ONLY from the Lemon Squeezy webhook handler. Never from a
 * client component, and never from `app/api/analyze/route.ts` — that route
 * only ever reads tier, through the RLS-scoped `lib/supabase/server.ts`
 * client, never writes it.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
