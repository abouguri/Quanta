import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

/**
 * Refreshes the Supabase session cookie on every navigation, so a Server
 * Component never reads a stale or expired access token. `/api/analyze` is
 * excluded on purpose: that route builds its own Supabase client per request
 * (via lib/supabase/server.ts) and is deliberately dependency-light, so it
 * doesn't need — or want — an extra middleware hop in front of it.
 *
 * This runs on nearly every request, so a missing Supabase config must never
 * throw here — that would take down the entire app, not just accounts.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  if (!isSupabaseConfigured()) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  // Triggers a token refresh if the current access token has expired.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|api/analyze|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
