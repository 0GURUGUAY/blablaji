create policy "rides_delete_own"
  on public.rides
  for delete
  to authenticated
  using (auth.uid() = driver_id);