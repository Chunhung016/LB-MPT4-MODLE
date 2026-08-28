-- Parent accounts, reception activation requests, AI access, and auditable Bee Token wallets.

create table public.parent_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  parent_name text not null,
  child_name text not null,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parent_profiles_username_format check (
    username = lower(username)
    and username ~ '^[a-z0-9][a-z0-9._-]{2,31}$'
  ),
  constraint parent_profiles_parent_name_present check (length(btrim(parent_name)) between 1 and 80),
  constraint parent_profiles_child_name_present check (length(btrim(child_name)) between 1 and 80)
);

alter table public.devices
  add column owner_user_id uuid unique references public.parent_profiles(user_id) on delete cascade;

alter table public.entitlements
  drop constraint if exists entitlements_product_slug_check;

alter table public.entitlements
  add constraint entitlements_product_slug_check
  check (product_slug in ('spelling_bee', 'ai_features'));

create table public.activation_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text not null unique default ('BEE-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  user_id uuid not null references public.parent_profiles(user_id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  wants_spelling_bee boolean not null default false,
  wants_ai boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'cancelled')),
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id) on delete set null,
  constraint activation_request_has_product check (wants_spelling_bee or wants_ai)
);

create unique index activation_requests_one_pending_per_device_idx
  on public.activation_requests (device_id)
  where status = 'pending';

create index activation_requests_status_requested_idx
  on public.activation_requests (status, requested_at desc);

create table public.bee_token_wallets (
  user_id uuid primary key references public.parent_profiles(user_id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_credited integer not null default 0 check (lifetime_credited >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table public.bee_token_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.parent_profiles(user_id) on delete cascade,
  amount integer not null check (amount <> 0),
  balance_after integer not null check (balance_after >= 0),
  reason text not null check (length(btrim(reason)) between 1 and 160),
  activation_request_id uuid references public.activation_requests(id) on delete set null,
  staff_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index bee_token_ledger_user_created_idx
  on public.bee_token_ledger (user_id, created_at desc);

create trigger parent_profiles_set_updated_at
before update on public.parent_profiles
for each row execute function private.set_updated_at();

create trigger bee_token_wallets_set_updated_at
before update on public.bee_token_wallets
for each row execute function private.set_updated_at();

create or replace function private.handle_new_parent_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_username text;
  profile_parent_name text;
  profile_child_name text;
  profile_phone text;
begin
  if new.email is null or new.email not like '%@parents.littlebee.app' then
    return new;
  end if;

  profile_username := lower(btrim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  profile_parent_name := btrim(coalesce(new.raw_user_meta_data ->> 'parent_name', ''));
  profile_child_name := btrim(coalesce(new.raw_user_meta_data ->> 'child_name', ''));
  profile_phone := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'contact_phone', '')), '');

  if profile_username !~ '^[a-z0-9][a-z0-9._-]{2,31}$'
     or new.email <> profile_username || '@parents.littlebee.app'
     or length(profile_parent_name) not between 1 and 80
     or length(profile_child_name) not between 1 and 80 then
    raise exception 'Invalid Little Bee parent profile';
  end if;

  insert into public.parent_profiles (
    user_id,
    username,
    parent_name,
    child_name,
    contact_phone
  ) values (
    new.id,
    profile_username,
    profile_parent_name,
    profile_child_name,
    profile_phone
  );

  insert into public.bee_token_wallets (user_id)
  values (new.id);

  return new;
end;
$$;

revoke all on function private.handle_new_parent_user() from public, anon, authenticated;

create trigger on_auth_user_created_parent_profile
after insert on auth.users
for each row execute function private.handle_new_parent_user();

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
  existing_owner_id uuid;
  profile_row public.parent_profiles%rowtype;
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

  select id, owner_user_id
  into account_device_id, existing_owner_id
  from public.devices
  where token_hash = device_token_hash
  for update;

  if account_device_id is null then
    insert into public.devices (token_hash, owner_user_id, parent_name, child_name)
    values (device_token_hash, current_user_id, profile_row.parent_name, profile_row.child_name)
    returning id into account_device_id;
  elsif existing_owner_id is null or existing_owner_id = current_user_id then
    update public.devices
    set owner_user_id = current_user_id,
        parent_name = profile_row.parent_name,
        child_name = profile_row.child_name,
        last_seen_at = now()
    where id = account_device_id;
  else
    raise exception 'This device is already linked to another account';
  end if;

  insert into public.bee_token_wallets (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing;

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
      where ar.device_id = d.id and ar.status = 'pending'
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

  select d.id into account_device_id
  from public.devices d
  where d.token_hash = device_token_hash
    and d.owner_user_id = current_user_id;

  if account_device_id is null then
    raise exception 'Account device not found';
  end if;

  select ar.id into pending_request_id
  from public.activation_requests ar
  where ar.device_id = account_device_id and ar.status = 'pending'
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
    set wants_spelling_bee = p_wants_spelling_bee,
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
    on conflict (device_id, product_slug) do update
      set active = true,
          granted_by = staff_user_id,
          granted_at = now(),
          expires_at = null;
  end if;

  if p_grant_ai then
    insert into public.entitlements (device_id, product_slug, active, granted_by, granted_at)
    values (request_row.device_id, 'ai_features', true, staff_user_id, now())
    on conflict (device_id, product_slug) do update
      set active = true,
          granted_by = staff_user_id,
          granted_at = now(),
          expires_at = null;

    insert into public.bee_token_wallets (user_id, balance, lifetime_credited, updated_by)
    values (request_row.user_id, p_bee_tokens, p_bee_tokens, staff_user_id)
    on conflict (user_id) do update
      set balance = public.bee_token_wallets.balance + excluded.balance,
          lifetime_credited = public.bee_token_wallets.lifetime_credited + excluded.lifetime_credited,
          updated_by = staff_user_id
    returning balance into new_balance;

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
    select balance into new_balance
    from public.bee_token_wallets
    where user_id = request_row.user_id;
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

create or replace function public.add_bee_tokens(
  p_user_id uuid,
  p_amount integer,
  p_reason text default 'Reception reload'
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  staff_user_id uuid := auth.uid();
  new_balance integer;
begin
  if staff_user_id is null or not private.is_staff(staff_user_id) then
    raise exception 'Staff access required';
  end if;

  if p_amount is null or p_amount <= 0 or p_amount > 100000 then
    raise exception 'Bee Token reload must be between 1 and 100000';
  end if;

  if not exists (select 1 from public.parent_profiles where user_id = p_user_id) then
    raise exception 'Parent account not found';
  end if;

  insert into public.bee_token_wallets (user_id, balance, lifetime_credited, updated_by)
  values (p_user_id, p_amount, p_amount, staff_user_id)
  on conflict (user_id) do update
    set balance = public.bee_token_wallets.balance + excluded.balance,
        lifetime_credited = public.bee_token_wallets.lifetime_credited + excluded.lifetime_credited,
        updated_by = staff_user_id
  returning balance into new_balance;

  insert into public.bee_token_ledger (user_id, amount, balance_after, reason, staff_user_id)
  values (p_user_id, p_amount, new_balance, coalesce(nullif(btrim(p_reason), ''), 'Reception reload'), staff_user_id);

  return new_balance;
end;
$$;

revoke all on function public.add_bee_tokens(uuid, integer, text) from public, anon;
grant execute on function public.add_bee_tokens(uuid, integer, text) to authenticated;

-- The account-gated app replaces the previous anonymous device registration path.
revoke execute on function public.register_device(text) from anon, authenticated;

alter table public.parent_profiles enable row level security;
alter table public.activation_requests enable row level security;
alter table public.bee_token_wallets enable row level security;
alter table public.bee_token_ledger enable row level security;

revoke all on table public.parent_profiles from anon, authenticated;
revoke all on table public.activation_requests from anon, authenticated;
revoke all on table public.bee_token_wallets from anon, authenticated;
revoke all on table public.bee_token_ledger from anon, authenticated;

grant select on table public.parent_profiles to authenticated;
grant update (parent_name, child_name, contact_phone) on table public.parent_profiles to authenticated;
grant select on table public.activation_requests to authenticated;
grant select on table public.bee_token_wallets to authenticated;
grant select on table public.bee_token_ledger to authenticated;

create policy "Parents can view their profile"
on public.parent_profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Parents can update their profile"
on public.parent_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Staff can view parent profiles"
on public.parent_profiles
for select
to authenticated
using ((select private.is_staff(auth.uid())));

create policy "Parents can view their device"
on public.devices
for select
to authenticated
using ((select auth.uid()) = owner_user_id);

create policy "Parents can view their entitlements"
on public.entitlements
for select
to authenticated
using (
  exists (
    select 1 from public.devices d
    where d.id = entitlements.device_id
      and d.owner_user_id = (select auth.uid())
  )
);

create policy "Parents can view their activation requests"
on public.activation_requests
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Staff can view activation requests"
on public.activation_requests
for select
to authenticated
using ((select private.is_staff(auth.uid())));

create policy "Parents can view their Bee Token wallet"
on public.bee_token_wallets
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Staff can view Bee Token wallets"
on public.bee_token_wallets
for select
to authenticated
using ((select private.is_staff(auth.uid())));

create policy "Parents can view their Bee Token ledger"
on public.bee_token_ledger
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Staff can view Bee Token ledger"
on public.bee_token_ledger
for select
to authenticated
using ((select private.is_staff(auth.uid())));

comment on table public.parent_profiles is 'Parent account profiles keyed by Supabase Auth user ID; usernames are lowercase and unique.';
comment on table public.activation_requests is 'Reception activation requests represented by non-secret QR request codes.';
comment on table public.bee_token_wallets is 'Current Bee Token balance per parent account.';
comment on table public.bee_token_ledger is 'Immutable audit history for Bee Token credits and future debits.';
comment on function public.process_activation_request(text, boolean, boolean, integer) is 'Atomically grants selected products and initial Bee Tokens after verifying the caller is active staff.';
