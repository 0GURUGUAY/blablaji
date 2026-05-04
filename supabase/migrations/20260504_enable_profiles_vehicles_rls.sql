alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "vehicles_select_own"
  on public.vehicles
  for select
  to authenticated
  using (auth.uid() = driver_id);

create policy "vehicles_insert_own"
  on public.vehicles
  for insert
  to authenticated
  with check (auth.uid() = driver_id);

create policy "vehicles_update_own"
  on public.vehicles
  for update
  to authenticated
  using (auth.uid() = driver_id)
  with check (auth.uid() = driver_id);