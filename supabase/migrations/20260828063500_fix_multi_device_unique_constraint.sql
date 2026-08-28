-- 1. Remove the unique constraint on devices.owner_user_id so a parent can use multiple devices
alter table public.devices drop constraint if exists devices_owner_user_id_key;

-- 2. Update register_account_device to support multiple devices per parent account seamlessly
create or replace function public.register_account_device(p_device_token text)
returns table (
  activation_code text,
  spelling_bee_enabled boolean,
  ai_features_enabled boolean,
  bee_tokens integer,
  pending_request_code text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  device_token_hash text;
  account_device_id uuid;
  profile_row public.parent_profiles%rowtype;
  has_spelling boolean := false;
  has_ai boolean := false;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_device_token is null
     or length(p_device_token) < 32
     or length(p_device_token) > 128
     or p_device_token !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'Invalid device token';
  end if;

  select * into profile_row
  from public.parent_profiles
  where user_id = current_user_id;

  if not found then
    raise exception 'Parent profile not found';
  end if;

  device_token_hash := encode(extensions.digest(convert_to(p_device_token, 'UTF8'), 'sha256'), 'hex');

  select id into account_device_id
  from public.devices
  where token_hash = device_token_hash
  for update;

  if account_device_id is null then
    insert into public.devices (token_hash, owner_user_id, parent_name, child_name)
    values (device_token_hash, current_user_id, profile_row.parent_name, profile_row.child_name)
    returning id into account_device_id;
  else
    update public.devices
    set owner_user_id = current_user_id,
        parent_name = profile_row.parent_name,
        child_name = profile_row.child_name,
        last_seen_at = now()
    where id = account_device_id;
  end if;

  -- Ensure wallet exists
  insert into public.bee_token_wallets (user_id)
  values (current_user_id)
  on conflict on constraint bee_token_wallets_pkey do nothing;

  -- Sync active entitlements across all devices of this parent
  for has_spelling in
    select true from public.entitlements e
    join public.devices d on d.id = e.device_id
    where (d.owner_user_id = current_user_id or d.id = account_device_id)
      and e.product_slug = 'spelling_bee'
      and e.active
      and (e.expires_at is null or e.expires_at > now())
    limit 1
  loop
    insert into public.entitlements (device_id, product_slug, active, granted_at)
    values (account_device_id, 'spelling_bee', true, now())
    on conflict on constraint entitlements_device_id_product_slug_key do update
      set active = true, expires_at = null;
  end loop;

  for has_ai in
    select true from public.entitlements e
    join public.devices d on d.id = e.device_id
    where (d.owner_user_id = current_user_id or d.id = account_device_id)
      and e.product_slug = 'ai_features'
      and e.active
      and (e.expires_at is null or e.expires_at > now())
    limit 1
  loop
    insert into public.entitlements (device_id, product_slug, active, granted_at)
    values (account_device_id, 'ai_features', true, now())
    on conflict on constraint entitlements_device_id_product_slug_key do update
      set active = true, expires_at = null;
  end loop;

  return query
  select
    d.activation_code,
    exists (
      select 1 from public.entitlements e
      where e.device_id = d.id
        and e.product_slug = 'spelling_bee'
        and e.active
        and (e.expires_at is null or e.expires_at > now())
    ),
    exists (
      select 1 from public.entitlements e
      where e.device_id = d.id
        and e.product_slug = 'ai_features'
        and e.active
        and (e.expires_at is null or e.expires_at > now())
    ),
    coalesce(w.balance, 0),
    (
      select ar.request_code
      from public.activation_requests ar
      where ar.user_id = current_user_id and ar.status = 'pending'
      order by ar.requested_at desc
      limit 1
    )
  from public.devices d
  left join public.bee_token_wallets w on w.user_id = current_user_id
  where d.id = account_device_id;
end;
$$;

revoke all on function public.register_account_device(text) from public, anon;
grant execute on function public.register_account_device(text) to authenticated;

-- 3. Update create_activation_request so it self-heals and never fails with "Account device not found"
create or replace function public.create_activation_request(
  p_device_token text,
  p_wants_spelling_bee boolean,
  p_wants_ai boolean
)
returns table (request_id uuid, request_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  device_token_hash text;
  account_device_id uuid;
  pending_request_id uuid;
  profile_row public.parent_profiles%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not coalesce(p_wants_spelling_bee, false) and not coalesce(p_wants_ai, false) then
    raise exception 'Select at least one product';
  end if;

  if p_device_token is null
     or length(p_device_token) < 32
     or length(p_device_token) > 128
     or p_device_token !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'Invalid device token';
  end if;

  device_token_hash := encode(extensions.digest(convert_to(p_device_token, 'UTF8'), 'sha256'), 'hex');

  -- Auto-link or auto-create device if needed
  select d.id into account_device_id
  from public.devices d
  where d.token_hash = device_token_hash;

  if account_device_id is null then
    select * into profile_row
    from public.parent_profiles
    where user_id = current_user_id;

    insert into public.devices (token_hash, owner_user_id, parent_name, child_name)
    values (
      device_token_hash,
      current_user_id,
      coalesce(profile_row.parent_name, 'Parent'),
      coalesce(profile_row.child_name, 'Learner')
    )
    returning id into account_device_id;
  else
    update public.devices
    set owner_user_id = current_user_id,
        last_seen_at = now()
    where id = account_device_id;
  end if;

  select ar.id into pending_request_id
  from public.activation_requests ar
  where ar.user_id = current_user_id and ar.status = 'pending'
  for update;

  if pending_request_id is null then
    insert into public.activation_requests (
      user_id,
      device_id,
      wants_spelling_bee,
      wants_ai
    ) values (
      current_user_id,
      account_device_id,
      p_wants_spelling_bee,
      p_wants_ai
    )
    returning id into pending_request_id;
  else
    update public.activation_requests
    set device_id = account_device_id,
        wants_spelling_bee = p_wants_spelling_bee,
        wants_ai = p_wants_ai,
        requested_at = now()
    where id = pending_request_id;
  end if;

  return query
  select ar.id, ar.request_code
  from public.activation_requests ar
  where ar.id = pending_request_id;
end;
$$;

revoke all on function public.create_activation_request(text, boolean, boolean) from public, anon;
grant execute on function public.create_activation_request(text, boolean, boolean) to authenticated;

-- 4. Update process_activation_request to grant to all user's devices
create or replace function public.process_activation_request(
  p_request_code text,
  p_grant_spelling_bee boolean,
  p_grant_ai boolean,
  p_bee_tokens integer
)
returns table (user_id uuid, device_id uuid, bee_token_balance integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  staff_user_id uuid := auth.uid();
  request_row public.activation_requests%rowtype;
  new_balance integer;
begin
  if staff_user_id is null or not private.is_staff(staff_user_id) then
    raise exception 'Staff access required';
  end if;

  if not coalesce(p_grant_spelling_bee, false) and not coalesce(p_grant_ai, false) then
    raise exception 'Select at least one product to activate';
  end if;

  if coalesce(p_grant_ai, false) and (p_bee_tokens is null or p_bee_tokens <= 0 or p_bee_tokens > 100000) then
    raise exception 'AI activation requires a Bee Token amount between 1 and 100000';
  end if;

  select * into request_row
  from public.activation_requests
  where upper(request_code) = upper(btrim(p_request_code))
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Pending activation request not found';
  end if;

  if p_grant_spelling_bee then
    insert into public.entitlements (device_id, product_slug, active, granted_by, granted_at)
    select d.id, 'spelling_bee', true, staff_user_id, now()
    from public.devices d
    where d.owner_user_id = request_row.user_id or d.id = request_row.device_id
    on conflict on constraint entitlements_device_id_product_slug_key do update
      set active = true,
          granted_by = staff_user_id,
          granted_at = now(),
          expires_at = null;
  end if;

  if p_grant_ai then
    insert into public.entitlements (device_id, product_slug, active, granted_by, granted_at)
    select d.id, 'ai_features', true, staff_user_id, now()
    from public.devices d
    where d.owner_user_id = request_row.user_id or d.id = request_row.device_id
    on conflict on constraint entitlements_device_id_product_slug_key do update
      set active = true,
          granted_by = staff_user_id,
          granted_at = now(),
          expires_at = null;

    insert into public.bee_token_wallets (user_id, balance, lifetime_credited, updated_by)
    values (request_row.user_id, p_bee_tokens, p_bee_tokens, staff_user_id)
    on conflict on constraint bee_token_wallets_pkey do update
      set balance = public.bee_token_wallets.balance + excluded.balance,
          lifetime_credited = public.bee_token_wallets.lifetime_credited + excluded.lifetime_credited,
          updated_by = staff_user_id
    returning public.bee_token_wallets.balance into new_balance;

    insert into public.bee_token_ledger (
      user_id,
      amount,
      balance_after,
      reason,
      activation_request_id,
      staff_user_id
    ) values (
      request_row.user_id,
      p_bee_tokens,
      new_balance,
      'Initial AI activation',
      request_row.id,
      staff_user_id
    );
  else
    select w.balance into new_balance
    from public.bee_token_wallets w
    where w.user_id = request_row.user_id;
  end if;

  update public.activation_requests
  set status = 'approved',
      processed_at = now(),
      processed_by = staff_user_id
  where id = request_row.id;

  return query select request_row.user_id, request_row.device_id, coalesce(new_balance, 0);
end;
$$;

revoke all on function public.process_activation_request(text, boolean, boolean, integer) from public, anon;
grant execute on function public.process_activation_request(text, boolean, boolean, integer) to authenticated;
