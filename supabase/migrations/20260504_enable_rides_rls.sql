alter table public.rides enable row level security;

create policy "rides_select_own"
  on public.rides
  for select
  to authenticated
  using (auth.uid() = driver_id);

create policy "rides_insert_own"
  on public.rides
  for insert
  to authenticated
  with check (auth.uid() = driver_id);

create policy "rides_update_own"
  on public.rides
  for update
  to authenticated
  using (auth.uid() = driver_id)
  with check (auth.uid() = driver_id);