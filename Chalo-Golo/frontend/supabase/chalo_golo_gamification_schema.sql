-- CHALO-GOLO gamification schema (run in Supabase SQL editor or via CLI).
-- Idempotent where possible. Requires pgcrypto for gen_random_uuid().

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- public.users — progression mirror of auth.users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  avatar_url text,
  level text not null default 'spark' check (level in ('spark', 'blaze', 'nova')),
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  attention_score integer check (attention_score is null or (attention_score >= 0 and attention_score <= 100)),
  emergency_exit_left integer not null default 2 check (emergency_exit_left >= 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- roadmaps — persisted AI / gamified roadmap JSON
-- ---------------------------------------------------------------------------
create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  topic text not null,
  roadmap_json jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists roadmaps_user_created_idx on public.roadmaps (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- learning_history
-- ---------------------------------------------------------------------------
create table if not exists public.learning_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  roadmap_id uuid references public.roadmaps (id) on delete set null,
  topic text,
  node_title text,
  node_type text,
  xp_earned integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz
);

create index if not exists learning_history_user_idx on public.learning_history (user_id, completed_at desc nulls last);

-- ---------------------------------------------------------------------------
-- quiz_results
-- ---------------------------------------------------------------------------
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  roadmap_id uuid references public.roadmaps (id) on delete set null,
  score integer not null check (score >= 0 and score <= 100),
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists quiz_results_user_idx on public.quiz_results (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- badges
-- ---------------------------------------------------------------------------
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  badge_name text not null,
  badge_type text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_name)
);

create index if not exists badges_user_idx on public.badges (user_id, earned_at desc);

-- ---------------------------------------------------------------------------
-- sessions — online / consistency (demo-friendly)
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  online_duration integer not null default 0 check (online_duration >= 0)
);

create index if not exists sessions_user_started_idx on public.sessions (user_id, started_at desc);

-- ---------------------------------------------------------------------------
-- mini_games
-- ---------------------------------------------------------------------------
create table if not exists public.mini_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  game_type text not null,
  score integer not null default 0,
  duration integer not null default 0,
  played_at timestamptz not null default now()
);

create index if not exists mini_games_user_idx on public.mini_games (user_id, played_at desc);

-- ---------------------------------------------------------------------------
-- Auto-create public.users on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user_gamification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'learner')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_gamification on auth.users;
create trigger on_auth_user_created_gamification
  after insert on auth.users
  for each row execute function public.handle_new_user_gamification();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.roadmaps enable row level security;
alter table public.learning_history enable row level security;
alter table public.quiz_results enable row level security;
alter table public.badges enable row level security;
alter table public.sessions enable row level security;
alter table public.mini_games enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users for select to authenticated using (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists users_insert_own on public.users;
create policy users_insert_own on public.users for insert to authenticated with check (auth.uid() = id);

-- roadmaps
drop policy if exists roadmaps_select_own on public.roadmaps;
create policy roadmaps_select_own on public.roadmaps for select to authenticated using (auth.uid() = user_id);
drop policy if exists roadmaps_insert_own on public.roadmaps;
create policy roadmaps_insert_own on public.roadmaps for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists roadmaps_update_own on public.roadmaps;
create policy roadmaps_update_own on public.roadmaps for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists roadmaps_delete_own on public.roadmaps;
create policy roadmaps_delete_own on public.roadmaps for delete to authenticated using (auth.uid() = user_id);

-- learning_history
drop policy if exists lh_select_own on public.learning_history;
create policy lh_select_own on public.learning_history for select to authenticated using (auth.uid() = user_id);
drop policy if exists lh_insert_own on public.learning_history;
create policy lh_insert_own on public.learning_history for insert to authenticated with check (auth.uid() = user_id);

-- quiz_results
drop policy if exists qr_select_own on public.quiz_results;
create policy qr_select_own on public.quiz_results for select to authenticated using (auth.uid() = user_id);
drop policy if exists qr_insert_own on public.quiz_results;
create policy qr_insert_own on public.quiz_results for insert to authenticated with check (auth.uid() = user_id);

-- badges
drop policy if exists badges_select_own on public.badges;
create policy badges_select_own on public.badges for select to authenticated using (auth.uid() = user_id);
drop policy if exists badges_insert_own on public.badges;
create policy badges_insert_own on public.badges for insert to authenticated with check (auth.uid() = user_id);

-- sessions
drop policy if exists sessions_select_own on public.sessions;
create policy sessions_select_own on public.sessions for select to authenticated using (auth.uid() = user_id);
drop policy if exists sessions_insert_own on public.sessions;
create policy sessions_insert_own on public.sessions for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists sessions_update_own on public.sessions;
create policy sessions_update_own on public.sessions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- mini_games
drop policy if exists mg_select_own on public.mini_games;
create policy mg_select_own on public.mini_games for select to authenticated using (auth.uid() = user_id);
drop policy if exists mg_insert_own on public.mini_games;
create policy mg_insert_own on public.mini_games for insert to authenticated with check (auth.uid() = user_id);

commit;
