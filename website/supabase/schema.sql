-- ============================================================
-- AIMax / AI Engineering from Scratch — Supabase schema
-- Run this in the Supabase SQL Editor.
-- Safe to run more than once.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Per-lesson progress
-- ------------------------------------------------------------
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  phase_id text not null,
  lesson_id text not null,
  status text not null default 'available'
    check (status in ('locked', 'available', 'completed')),
  quiz_score integer
    check (quiz_score is null or (quiz_score >= 0 and quiz_score <= 100)),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_progress_user_lesson_unique
    unique (user_id, phase_id, lesson_id)
);

create index if not exists user_progress_user_idx
  on public.user_progress (user_id);

create index if not exists user_progress_user_phase_idx
  on public.user_progress (user_id, phase_id);

-- ------------------------------------------------------------
-- 2. User preferences
-- ------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  theme text not null default 'auto'
    check (theme in ('auto', 'light', 'dark')),
  language text not null default 'ar'
    check (language in ('ar', 'en')),
  notifications boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. updated_at trigger
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_progress_updated_at on public.user_progress;
create trigger set_user_progress_updated_at
  before update on public.user_progress
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
  before update on public.user_settings
  for each row
  execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 4. Row Level Security
-- ------------------------------------------------------------
alter table public.user_progress enable row level security;
alter table public.user_settings enable row level security;

-- user_progress: each authenticated user can only touch their own rows.
drop policy if exists "Users can read own progress" on public.user_progress;
create policy "Users can read own progress"
  on public.user_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own progress" on public.user_progress;
create policy "Users can insert own progress"
  on public.user_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on public.user_progress;
create policy "Users can update own progress"
  on public.user_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own progress" on public.user_progress;
create policy "Users can delete own progress"
  on public.user_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- user_settings: each authenticated user can only touch their own row.
drop policy if exists "Users can read own settings" on public.user_settings;
create policy "Users can read own settings"
  on public.user_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
  on public.user_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
  on public.user_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own settings" on public.user_settings;
create policy "Users can delete own settings"
  on public.user_settings
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. Table privileges (RLS still applies)
-- ------------------------------------------------------------
revoke all on table public.user_progress from anon;
revoke all on table public.user_settings from anon;

grant select, insert, update, delete on table public.user_progress to authenticated;
grant select, insert, update, delete on table public.user_settings to authenticated;
