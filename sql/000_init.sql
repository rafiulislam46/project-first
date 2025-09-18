-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- Profiles table referencing auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  plan text not null default 'free',
  credits int not null default 5,
  created_at timestamp with time zone not null default now()
);

-- Assets saved per-user
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null, -- 'tryon' | 'template'
  src_urls jsonb not null default '[]'::jsonb,
  copy jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

-- Catalog models and templates (public reference data)
create table if not exists public.catalog_models (
  id text primary key,
  name text,
  gender text,
  thumb_url text,
  styles jsonb
);

create table if not exists public.catalog_templates (
  id text primary key,
  name text,
  category text,
  ref_url text,
  thumb text
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.assets enable row level security;

-- Profiles: users can select and update only their row
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Assets: users can manage only their rows
create policy "read own assets" on public.assets
  for select using (auth.uid() = user_id);
create policy "insert own assets" on public.assets
  for insert with check (auth.uid() = user_id);
create policy "delete own assets" on public.assets
  for delete using (auth.uid() = user_id);

-- Helper RPC to decrement one credit atomically
create or replace function public.use_one_credit(p_user_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  current_plan text;
  current_credits int;
  remaining int;
  ok boolean := false;
begin
  select plan, credits into current_plan, current_credits from public.profiles where id = p_user_id for update;
  if not found then
    -- initialize profile if missing
    insert into public.profiles (id, plan, credits) values (p_user_id, 'free', 5)
    on conflict (id) do nothing;
    current_plan := 'free';
    current_credits := 5;
  end if;

  if current_credits = -1 then
    ok := true;
    remaining := -1;
  elsif current_credits > 0 then
    update public.profiles set credits = credits - 1 where id = p_user_id;
    ok := true;
    remaining := current_credits - 1;
  else
    ok := false;
    remaining := current_credits;
  end if;

  return json_build_object('ok', ok, 'remaining', remaining);
end;
$$;