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
    values (request_row.device_id, 'spelling_bee', true, staff_user_id, now())
    on conflict on constraint entitlements_device_id_product_slug_key do update
      set active = true,
          granted_by = staff_user_id,
          granted_at = now(),
          expires_at = null;
  end if;

  if p_grant_ai then
    insert into public.entitlements (device_id, product_slug, active, granted_by, granted_at)
    values (request_row.device_id, 'ai_features', true, staff_user_id, now())
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
