create extension if not exists pgcrypto;

create table if not exists public.users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  subscription_status text not null default 'free' check (
    subscription_status in ('free', 'active', 'trialing', 'past_due', 'canceled')
  ),
  generation_count integer not null default 0,
  generation_date date default current_date,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  summary text not null,
  goal text not null,
  style text not null,
  duration text not null,
  payload jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists ideas_user_id_created_at_idx on public.ideas (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists set_ideas_updated_at on public.ideas;
create trigger set_ideas_updated_at
before update on public.ideas
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.ideas enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
using (auth.uid() = user_id);

drop policy if exists "Users can read own ideas" on public.ideas;
create policy "Users can read own ideas"
on public.ideas
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own ideas" on public.ideas;
create policy "Users can insert own ideas"
on public.ideas
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own ideas" on public.ideas;
create policy "Users can update own ideas"
on public.ideas
for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete own ideas" on public.ideas;
create policy "Users can delete own ideas"
on public.ideas
for delete
using (auth.uid() = user_id);
