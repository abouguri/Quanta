-- Phase 2: analyses (server-side history for signed-in users).
-- Run by hand in the Supabase SQL editor, after 0001_init.sql.

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text,
  title text,
  score integer not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index analyses_user_id_created_at_idx on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

create policy "analyses_select_own" on public.analyses
  for select using (auth.uid() = user_id);

create policy "analyses_insert_own" on public.analyses
  for insert with check (auth.uid() = user_id);

create policy "analyses_delete_own" on public.analyses
  for delete using (auth.uid() = user_id);

-- No update policy: an analysis is immutable once saved, same as the
-- localStorage model it replaces for signed-in users (delete + re-save is
-- the only "edit").
