/**
 * Whether Supabase is actually configured. Every Supabase entry point checks
 * this before constructing a client — the underlying `@supabase/ssr` /
 * `@supabase/supabase-js` constructors throw synchronously on a missing
 * URL/key, and this project's house rule (Upstash, Google Fact Check, Brave)
 * is that a missing optional integration degrades the feature, not the app:
 * signed-out behavior everywhere accounts aren't set up yet, never a 500.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
