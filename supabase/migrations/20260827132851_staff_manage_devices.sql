grant insert, delete on table public.devices to authenticated;

create policy "Staff can create devices"
on public.devices
for insert
to authenticated
with check ((select private.is_staff(auth.uid())));

create policy "Staff can delete devices"
on public.devices
for delete
to authenticated
using ((select private.is_staff(auth.uid())));
