import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST-only on purpose: a bare GET link is prefetchable (by the browser or a
 * link-scanning proxy), which would sign a user out without them clicking
 * anything.
 */
export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', request.url))
}
