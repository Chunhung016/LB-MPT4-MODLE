-- 1. Create spelling bee leaderboard table
create table if not exists public.spelling_bee_leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  child_name text not null,
  theme_name text not null,
  score integer not null default 0,
  mastered_count integer not null default 0,
  total_questions integer not null default 0,
  max_streak integer not null default 0,
  time_seconds integer not null default 0,
  created_at timestamptz default now()
);

-- Index for fast ranking query
create index if not exists idx_spelling_bee_leaderboard_score on public.spelling_bee_leaderboard(score desc, created_at desc);
create index if not exists idx_spelling_bee_leaderboard_created_at on public.spelling_bee_leaderboard(created_at desc);

-- 2. Enable Row Level Security (RLS)
alter table public.spelling_bee_leaderboard enable row level security;

-- Public can read all leaderboard scores
create policy "Allow everyone to read leaderboard"
  on public.spelling_bee_leaderboard
  for select
  using (true);

-- Authenticated and anonymous users can submit scores
create policy "Allow inserting game scores"
  on public.spelling_bee_leaderboard
  for insert
  with check (true);
