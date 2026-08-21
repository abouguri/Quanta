-- Phase 1: profiles (one row per auth user, free tier by default).
-- Run by hand in the Supabase SQL editor — see README's "Accounts setup"
-- section (or .env.local.example) for the full external setup checklist.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  tier text not null default 'free' check (tier in ('free', 'paid')),
  lemonsqueezy_customer_id text,
  lemonsqueezy_subscription_id text,
  subscription_status text,
  subscription_renews_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A signed-in user may read only their own profile.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- Deliberately no insert/update/delete policy for `authenticated` here.
-- tier and the subscription_* columns are never client-writable — only
-- lib/supabase/admin.ts's service-role client (the Lemon Squeezy webhook,
-- added in Phase 3) can write them, because the service role bypasses RLS
-- entirely. This mirrors the same principle already documented in CLAUDE.md
-- for tier resolution in app/api/analyze/route.ts: never trust a
-- client-supplied value, only a trusted server-side path.

-- Auto-create a profile row on signup, defaulting to the free tier.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
