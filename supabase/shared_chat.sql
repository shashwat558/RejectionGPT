-- Shared chat snapshots
create table if not exists public.shared_chat (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  conversation_id uuid,
  title text,
  messages jsonb not null,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

alter table public.shared_chat enable row level security;

create policy "public read shared chats"
  on public.shared_chat
  for select
  using (true);

create policy "users create shared chats"
  on public.shared_chat
  for insert
  with check (auth.uid() = created_by);

create policy "users delete shared chats"
  on public.shared_chat
  for delete
  using (auth.uid() = created_by);
