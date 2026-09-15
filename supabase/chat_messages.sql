-- Chat message persistence (source of truth; zustand is UI cache only)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversation(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "owner all messages" on public.messages;
create policy "owner all messages" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
