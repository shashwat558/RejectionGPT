-- Practice engine (P1): track-based drills with attempts + deterministic scoring.
-- Tracks: aptitude (MCQ, timed), cs (MCQ, timed), dsa (approach-then-editorial).
-- Correct answers / explanations / editorials live server-side only and are
-- never returned to the client except as feedback for a recorded attempt.

create table if not exists public.practice_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track text not null check (track in ('aptitude', 'cs', 'dsa')),
  topic text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  analysis_id uuid,
  question_count int not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.practice_sets(id) on delete cascade,
  idx int not null default 0,
  track text not null check (track in ('aptitude', 'cs', 'dsa')),
  topic text not null,
  difficulty text not null,
  prompt text not null,
  options jsonb,
  correct_index int,
  explanation text,
  editorial text,
  hints jsonb,
  created_at timestamptz default now()
);

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.practice_sets(id) on delete cascade,
  question_id uuid not null references public.practice_questions(id) on delete cascade,
  selected_index int,
  answer_text text,
  correct boolean,
  time_spent int not null default 0,
  created_at timestamptz default now()
);

create index if not exists practice_sets_user_idx on public.practice_sets (user_id, created_at desc);
create index if not exists practice_questions_set_idx on public.practice_questions (set_id, idx);
create index if not exists practice_attempts_user_q_idx on public.practice_attempts (user_id, question_id, created_at desc);

alter table public.practice_sets enable row level security;
alter table public.practice_questions enable row level security;
alter table public.practice_attempts enable row level security;

drop policy if exists "owner all practice_sets" on public.practice_sets;
create policy "owner all practice_sets" on public.practice_sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "owner all practice_attempts" on public.practice_attempts;
create policy "owner all practice_attempts" on public.practice_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Questions inherit ownership via their set; service role bypasses RLS.
-- Authenticated users may read questions only through sets they own, and
-- insert questions only into sets they own (generation happens server-side
-- in the same request that creates the set).
drop policy if exists "owner read practice_questions" on public.practice_questions;
create policy "owner read practice_questions" on public.practice_questions
  for select using (
    exists (
      select 1 from public.practice_sets s
      where s.id = practice_questions.set_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "owner insert practice_questions" on public.practice_questions;
create policy "owner insert practice_questions" on public.practice_questions
  for insert with check (
    exists (
      select 1 from public.practice_sets s
      where s.id = practice_questions.set_id and s.user_id = auth.uid()
    )
  );
