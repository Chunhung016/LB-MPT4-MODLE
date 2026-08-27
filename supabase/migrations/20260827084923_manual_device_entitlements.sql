-- Manual product entitlements for Little Bee worksheet devices.
-- Child-facing browsers authenticate with a high-entropy local device token.
-- Staff authenticate through Supabase Auth and are authorized by staff_users.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Little Bee Staff',
  role text not null default 'staff' check (role in ('staff', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  activation_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  parent_name text,
  child_name text,
  notes text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  product_slug text not null check (product_slug in ('spelling_bee')),
  active boolean not null default true,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (device_id, product_slug)
);

create table public.entitlement_audit_log (
  id bigint generated always as identity primary key,
  device_id uuid not null references public.devices(id) on delete cascade,
  product_slug text not null,
  action text not null check (action in ('granted', 'revoked')),
  staff_user_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create or replace function private.is_staff(check_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_users
    where user_id = check_user_id
      and active = true
  );
$$;

revoke all on function private.is_staff(uuid) from public, anon;
grant execute on function private.is_staff(uuid) to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger devices_set_updated_at
before update on public.devices
for each row execute function private.set_updated_at();

create trigger entitlements_set_updated_at
before update on public.entitlements
for each row execute function private.set_updated_at();

create or replace function private.audit_entitlement_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.active is distinct from new.active then
    insert into public.entitlement_audit_log (
      device_id,
      product_slug,
      action,
      staff_user_id
    ) values (
      new.device_id,
      new.product_slug,
      case when new.active then 'granted' else 'revoked' end,
      new.granted_by
    );
  end if;
  return new;
end;
$$;

create trigger entitlements_audit_change
after insert or update on public.entitlements
for each row execute function private.audit_entitlement_change();

create or replace function public.register_device(p_device_token text)
returns table (activation_code text, spelling_bee_enabled boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  device_token_hash text;
begin
  if p_device_token is null
     or length(p_device_token) < 32
     or length(p_device_token) > 128
     or p_device_token !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'Invalid device token';
  end if;

  device_token_hash := encode(extensions.digest(convert_to(p_device_token, 'UTF8'), 'sha256'), 'hex');

  insert into public.devices (token_hash)
  values (device_token_hash)
  on conflict (token_hash) do update
    set last_seen_at = now();

  return query
  select
    d.activation_code,
    coalesce(e.active and (e.expires_at is null or e.expires_at > now()), false)
  from public.devices d
  left join public.entitlements e
    on e.device_id = d.id
   and e.product_slug = 'spelling_bee'
  where d.token_hash = device_token_hash;
end;
$$;

revoke all on function public.register_device(text) from public;
grant execute on function public.register_device(text) to anon, authenticated;

alter table public.staff_users enable row level security;
alter table public.devices enable row level security;
alter table public.entitlements enable row level security;
alter table public.entitlement_audit_log enable row level security;

revoke all on table public.staff_users from anon, authenticated;
revoke all on table public.devices from anon, authenticated;
revoke all on table public.entitlements from anon, authenticated;
revoke all on table public.entitlement_audit_log from anon, authenticated;

grant select on table public.staff_users to authenticated;
grant select, update on table public.devices to authenticated;
grant select, insert, update on table public.entitlements to authenticated;
grant select on table public.entitlement_audit_log to authenticated;

create policy "Staff can view their own staff record"
on public.staff_users
for select
to authenticated
using ((select auth.uid()) = user_id and active = true);

create policy "Staff can view devices"
on public.devices
for select
to authenticated
using ((select private.is_staff(auth.uid())));

create policy "Staff can update devices"
on public.devices
for update
to authenticated
using ((select private.is_staff(auth.uid())))
with check ((select private.is_staff(auth.uid())));

create policy "Staff can view entitlements"
on public.entitlements
for select
to authenticated
using ((select private.is_staff(auth.uid())));

create policy "Staff can create entitlements"
on public.entitlements
for insert
to authenticated
with check (
  (select private.is_staff(auth.uid()))
  and granted_by = (select auth.uid())
);

create policy "Staff can update entitlements"
on public.entitlements
for update
to authenticated
using ((select private.is_staff(auth.uid())))
with check (
  (select private.is_staff(auth.uid()))
  and granted_by = (select auth.uid())
);

create policy "Staff can view entitlement audit log"
on public.entitlement_audit_log
for select
to authenticated
using ((select private.is_staff(auth.uid())));

create index devices_activation_code_idx on public.devices (activation_code);
create index entitlements_device_id_idx on public.entitlements (device_id);
create index entitlement_audit_log_device_id_idx on public.entitlement_audit_log (device_id);

comment on table public.devices is 'Worksheet browser registrations; token_hash is a one-way hash of a local bearer token.';
comment on table public.entitlements is 'Products manually granted to a registered worksheet device.';
comment on function public.register_device(text) is 'Registers or refreshes a worksheet device and returns only its code and active Spelling Bee status.';
