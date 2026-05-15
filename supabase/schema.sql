create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  target_customer text not null,
  tone text not null,
  output text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.generations enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "generations_select_own"
on public.generations for select
to authenticated
using (auth.uid() = user_id);

create policy "generations_insert_own"
on public.generations for insert
to authenticated
with check (auth.uid() = user_id);

create index if not exists generations_user_created_idx
on public.generations(user_id, created_at desc);
