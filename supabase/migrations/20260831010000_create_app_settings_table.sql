-- Migration: Create app_settings table for global system configurations (e.g. system maintenance)
-- This ensures all devices (Laptops, iPads, iPhones, Android) sync maintenance status in real-time.

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.app_settings enable row level security;

-- Drop existing policies if any
drop policy if exists "Allow all users to read app_settings" on public.app_settings;
drop policy if exists "Allow staff to insert app_settings" on public.app_settings;
drop policy if exists "Allow staff to update app_settings" on public.app_settings;
drop policy if exists "Allow staff to delete app_settings" on public.app_settings;

-- 1. Anyone (including anonymous users, iPad / mobile students) can read app_settings
create policy "Allow all users to read app_settings"
  on public.app_settings for select
  using (true);

-- 2. Only active staff can insert/update app settings
create policy "Allow staff to insert app_settings"
  on public.app_settings for insert
  with check (
    exists (
      select 1 from public.staff_users
      where user_id = auth.uid() and active = true
    )
  );

create policy "Allow staff to update app_settings"
  on public.app_settings for update
  using (
    exists (
      select 1 from public.staff_users
      where user_id = auth.uid() and active = true
    )
  );

-- Helper RPC for atomic admin setting save
create or replace function public.set_app_setting(
  p_key text,
  p_value jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  calling_user_id uuid := auth.uid();
  is_staff boolean := false;
begin
  if calling_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required.');
  end if;

  select exists (
    select 1 from public.staff_users
    where user_id = calling_user_id and active = true
  ) into is_staff;

  if not is_staff then
    return jsonb_build_object('success', false, 'error', 'Active staff access required.');
  end if;

  insert into public.app_settings (key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key)
  do update set
    value = excluded.value,
    updated_at = excluded.updated_at;

  return jsonb_build_object('success', true, 'key', p_key);
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;

revoke all on function public.set_app_setting(text, jsonb) from public, anon;
grant execute on function public.set_app_setting(text, jsonb) to authenticated;

-- Enable Realtime for app_settings
alter publication supabase_realtime add table public.app_settings;
