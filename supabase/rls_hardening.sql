-- RejectionGPT RLS hardening (apply in Supabase SQL editor)
-- Ensures users can only access their own rows. Service role bypasses RLS.

alter table analysis_result enable row level security;
alter table conversation enable row level security;
alter table interview enable row level security;
alter table resume enable row level security;
alter table job_desc enable row level security;

-- Drop permissive policies if they exist, then create owner-only policies
do $$ begin
  -- analysis_result
  drop policy if exists "owner all" on analysis_result;
  create policy "owner all" on analysis_result for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  -- conversation
  drop policy if exists "owner all" on conversation;
  create policy "owner all" on conversation for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  -- interview
  drop policy if exists "owner all" on interview;
  create policy "owner all" on interview for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  -- resume
  drop policy if exists "owner all" on resume;
  create policy "owner all" on resume for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  -- job_desc
  drop policy if exists "owner all" on job_desc;
  create policy "owner all" on job_desc for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when others then null;
end $$;
