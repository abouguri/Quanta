import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * The server-side Supabase client — for Server Components, Server Actions,
 * and Route Handlers alike. Route Handlers share the same `cookies()` access
 * as Server Components in the App Router, so one helper covers both; there's
 * no need for a second client built from a raw `request.headers` cookie
 * parse.
 *
 * A Server Component can't write cookies (only read them), so `setAll` is a
 * no-op there — session refresh happens in `middleware.ts` instead, which can
 * write cookies on every request.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Called from a Server Component, which can't set cookies.
            // middleware.ts refreshes the session on the next request instead.
          }
        },
      },
    },
  )
}
