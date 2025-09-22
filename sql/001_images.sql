-- Images table requested
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  model_id text,
  template_id text,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.images enable row level security;

-- Policies: users can manage only their own images
create policy "read own images" on public.images
  for select using (auth.uid() = user_id);
create policy "insert own images" on public.images
  for insert with check (auth.uid() = user_id);
create policy "delete own images" on public.images
  for delete using (auth.uid() = user_id);