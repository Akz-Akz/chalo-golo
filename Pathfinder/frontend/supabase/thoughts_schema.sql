-- Pathfinder production schema for user thoughts + generated roadmaps.
-- Safe to run multiple times (idempotent blocks included).

begin;

-- Required extension for gen_random_uuid() (already enabled on many Supabase projects).
create extension if not exists pgcrypto;

create table if not exists public.thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Core thought metadata
  title text not null check (char_length(title) >= 1 and char_length(title) <= 300),
  goal text not null default '' check (char_length(goal) <= 2000),
  category text not null default 'Goal' check (char_length(category) <= 120),
  status text not null default 'active' check (status in ('active', 'planning', 'paused', 'completed', 'archived')),
  color text not null default '#4b36cc' check (char_length(color) <= 20),

  -- Progress + UX fields
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  phase text,
  next_task text,
  eta text,
  reality_score integer check (reality_score is null or (reality_score >= 0 and reality_score <= 100)),
  weekly_hours text,
  tags text[] not null default '{}',

  -- Structured payloads for roadmap generator
  thought_data jsonb not null default '{}'::jsonb,
  roadmap jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Update timestamp trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_thoughts_set_updated_at on public.thoughts;
create trigger trg_thoughts_set_updated_at
before update on public.thoughts
for each row execute function public.set_updated_at();

-- Index strategy:
-- 1) critical user-scoped timeline queries
create index if not exists thoughts_user_created_idx
  on public.thoughts (user_id, created_at desc);

create index if not exists thoughts_user_status_created_idx
  on public.thoughts (user_id, status, created_at desc);

-- 2) text search for user thoughts (optional but useful for dashboard search)
create index if not exists thoughts_goal_search_idx
  on public.thoughts using gin (to_tsvector('simple', coalesce(goal, '') || ' ' || coalesce(title, '')));

-- 3) JSONB indexing for roadmap / thought metadata filters
create index if not exists thoughts_thought_data_gin_idx
  on public.thoughts using gin (thought_data);

create index if not exists thoughts_roadmap_gin_idx
  on public.thoughts using gin (roadmap);

-- Enable row level security
alter table public.thoughts enable row level security;

-- Policies: each user can only see/change own rows.
drop policy if exists "thoughts_select_own" on public.thoughts;
create policy "thoughts_select_own"
on public.thoughts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "thoughts_insert_own" on public.thoughts;
create policy "thoughts_insert_own"
on public.thoughts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "thoughts_update_own" on public.thoughts;
create policy "thoughts_update_own"
on public.thoughts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "thoughts_delete_own" on public.thoughts;
create policy "thoughts_delete_own"
on public.thoughts
for delete
to authenticated
using (auth.uid() = user_id);

commit;

-- Optional helper view for dashboard summary (readable via RLS)
create or replace view public.thoughts_summary as
select
  user_id,
  count(*) as total_thoughts,
  count(*) filter (where status = 'active') as active_thoughts,
  avg(reality_score) filter (where reality_score is not null) as avg_reality_score,
  max(created_at) as last_thought_at
from public.thoughts
group by user_id;

