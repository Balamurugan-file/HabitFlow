-- HabitFlow Supabase schema
-- Run this entire script in Supabase Dashboard > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 70),
  category text not null default 'Personal',
  frequency text not null default 'Daily' check (frequency in ('Daily','Weekly')),
  target text default '1',
  description text default '',
  icon text default '✨',
  color text default '#766BFF',
  created_at timestamptz not null default now()
);

create table if not exists public.habit_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  date date not null,
  status text not null check (status in ('done','missed','pending','hold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habit_entries_user_date_idx on public.habit_entries(user_id, date);
create index if not exists habit_entries_habit_date_idx on public.habit_entries(habit_id, date);

alter table public.habits enable row level security;
alter table public.habit_entries enable row level security;

drop policy if exists "Users manage their own habits" on public.habits;
create policy "Users manage their own habits" on public.habits
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage their own habit entries" on public.habit_entries;
create policy "Users manage their own habit entries" on public.habit_entries
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Additional integrity: users can only add entries for habits they own.
create or replace function public.verify_habit_entry_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.habits h
    where h.id = new.habit_id and h.user_id = auth.uid()
  ) then
    raise exception 'Habit does not belong to the current user';
  end if;
  return new;
end;
$$;

drop trigger if exists verify_habit_entry_owner on public.habit_entries;
create trigger verify_habit_entry_owner
before insert or update on public.habit_entries
for each row execute function public.verify_habit_entry_owner();
