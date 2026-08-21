import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Landing target for both magic-link emails and (once added) OAuth redirects
 * — Supabase's `emailRedirectTo` and OAuth `redirectTo` both point here, so
 * this one handler covers both without a rework when OAuth providers are
 * added later.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/`)
}
