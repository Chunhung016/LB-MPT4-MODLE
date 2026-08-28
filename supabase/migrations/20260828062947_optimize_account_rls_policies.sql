drop policy if exists "Staff can view devices" on public.devices;
drop policy if exists "Parents can view their device" on public.devices;
drop policy if exists "Staff can update devices" on public.devices;
drop policy if exists "Staff can create devices" on public.devices;
drop policy if exists "Staff can delete devices" on public.devices;

create policy "Authorized users can view devices"
on public.devices
for select
to authenticated
using (
  owner_user_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
);

create policy "Staff can update devices"
on public.devices
for update
to authenticated
using (private.is_staff((select auth.uid())))
with check (private.is_staff((select auth.uid())));

create policy "Staff can create devices"
on public.devices
for insert
to authenticated
with check (private.is_staff((select auth.uid())));

create policy "Staff can delete devices"
on public.devices
for delete
to authenticated
using (private.is_staff((select auth.uid())));

drop policy if exists "Staff can view entitlements" on public.entitlements;
drop policy if exists "Parents can view their entitlements" on public.entitlements;
drop policy if exists "Staff can create entitlements" on public.entitlements;
drop policy if exists "Staff can update entitlements" on public.entitlements;

create policy "Authorized users can view entitlements"
on public.entitlements
for select
to authenticated
using (
  private.is_staff((select auth.uid()))
  or exists (
    select 1 from public.devices d
    where d.id = entitlements.device_id
      and d.owner_user_id = (select auth.uid())
  )
);

create policy "Staff can create entitlements"
on public.entitlements
for insert
to authenticated
with check (
  private.is_staff((select auth.uid()))
  and granted_by = (select auth.uid())
);

create policy "Staff can update entitlements"
on public.entitlements
for update
to authenticated
using (private.is_staff((select auth.uid())))
with check (
  private.is_staff((select auth.uid()))
  and granted_by = (select auth.uid())
);

drop policy if exists "Staff can view entitlement audit log" on public.entitlement_audit_log;
create policy "Staff can view entitlement audit log"
on public.entitlement_audit_log
for select
to authenticated
using (private.is_staff((select auth.uid())));

drop policy if exists "Parents can view their profile" on public.parent_profiles;
drop policy if exists "Staff can view parent profiles" on public.parent_profiles;
create policy "Authorized users can view parent profiles"
on public.parent_profiles
for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
);

drop policy if exists "Parents can view their activation requests" on public.activation_requests;
drop policy if exists "Staff can view activation requests" on public.activation_requests;
create policy "Authorized users can view activation requests"
on public.activation_requests
for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
);

drop policy if exists "Parents can view their Bee Token wallet" on public.bee_token_wallets;
drop policy if exists "Staff can view Bee Token wallets" on public.bee_token_wallets;
create policy "Authorized users can view Bee Token wallets"
on public.bee_token_wallets
for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
);

drop policy if exists "Parents can view their Bee Token ledger" on public.bee_token_ledger;
drop policy if exists "Staff can view Bee Token ledger" on public.bee_token_ledger;
create policy "Authorized users can view Bee Token ledger"
on public.bee_token_ledger
for select
to authenticated
using (
  user_id = (select auth.uid())
  or private.is_staff((select auth.uid()))
);
