-- HookLab: persisted chats (run in Supabase SQL editor or via CLI)
-- Requires: Auth (email/password) enabled in Supabase project

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  messages jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists chats_user_id_created_at_idx
  on public.chats (user_id, created_at desc);

alter table public.chats enable row level security;

drop policy if exists "Users select own chats" on public.chats;
drop policy if exists "Users insert own chats" on public.chats;
drop policy if exists "Users update own chats" on public.chats;
drop policy if exists "Users delete own chats" on public.chats;

create policy "Users select own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users insert own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users update own chats"
  on public.chats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own chats"
  on public.chats for delete
  using (auth.uid() = user_id);
