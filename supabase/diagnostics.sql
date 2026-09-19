-- P2 diagnostics: baseline skill test (3 linked practice sets) + role fits + study plan.
-- Sets themselves live in practice_sets (kind stays 'practice'); this row links
-- them and stores computed outcomes. All JSONB so the fit model can evolve
-- without migrations. Roadmap export writes into analysis_result.roadmap
-- on demand (never automatically).

create table if not exists public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null check (tier in ('tier1', 'tier2', 'tier3', 'other')),
  months_left int not null check (months_left >= 1 and months_left <= 24),
  set_ids uuid[] not null default '{}',
  status text not null default 'started' check (status in ('started', 'completed')),
  scores jsonb,
  role_fits jsonb,
  plan jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create index if not exists diagnostics_user_idx on public.diagnostics (user_id, created_at desc);

alter table public.diagnostics enable row level security;

drop policy if exists "owner all diagnostics" on public.diagnostics;
create policy "owner all diagnostics" on public.diagnostics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
