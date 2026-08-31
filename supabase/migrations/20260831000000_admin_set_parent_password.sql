-- Migration: Add secure staff RPC to reset parent passwords directly
-- This enables direct password updates even without edge functions.

create or replace function public.admin_set_parent_password(
  p_user_id uuid,
  p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  calling_user_id uuid := auth.uid();
  is_staff boolean := false;
  target_profile public.parent_profiles%rowtype;
  encrypted_pw text;
begin
  -- 1. Validate caller is authenticated staff
  if calling_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Authentication required.');
  end if;

  select exists(
    select 1 from public.staff_users
    where user_id = calling_user_id and active = true
  ) into is_staff;

  if not is_staff then
    return jsonb_build_object('success', false, 'error', 'Active staff access required.');
  end if;

  -- 2. Validate password
  if length(p_password) < 8 or length(p_password) > 72 then
    return jsonb_build_object('success', false, 'error', 'Password must be 8–72 characters.');
  end if;

  -- 3. Check target parent profile exists
  select * into target_profile
  from public.parent_profiles
  where user_id = p_user_id;

  if target_profile.user_id is null then
    return jsonb_build_object('success', false, 'error', 'Parent account profile not found.');
  end if;

  -- 4. Update auth.users password using pgcrypto crypt
  encrypted_pw := extensions.crypt(p_password, extensions.gen_salt('bf'));

  update auth.users
  set encrypted_password = encrypted_pw,
      updated_at = now()
  where id = p_user_id;

  return jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'username', target_profile.username
  );
exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;

revoke all on function public.admin_set_parent_password(uuid, text) from public, anon;
grant execute on function public.admin_set_parent_password(uuid, text) to authenticated;
