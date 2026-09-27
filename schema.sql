-- Run once in the Supabase SQL Editor.
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  activity text not null check (char_length(activity) between 1 and 80),
  session_date date not null,
  status text not null default 'Planned' check (status in ('Planned', 'Recorded', 'Reviewed')),
  notes text not null default '' check (char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_date_idx on public.sessions (user_id, session_date desc);
alter table public.sessions enable row level security;
create policy "Users can read own sessions" on public.sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add own sessions" on public.sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can edit own sessions" on public.sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own sessions" on public.sessions for delete to authenticated using ((select auth.uid()) = user_id);
