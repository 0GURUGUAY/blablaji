create or replace function public.reserve_ride_seat(
  target_ride_id uuid,
  requested_seats integer default 1,
  requested_pickup_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  booking_id uuid;
  ride_driver_id uuid;
  available_seats integer;
  ride_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if requested_seats is null or requested_seats < 1 then
    raise exception 'You must reserve at least one seat';
  end if;

  select r.driver_id, r.seats_available, r.status
  into ride_driver_id, available_seats, ride_status
  from public.rides r
  where r.id = target_ride_id
  for update;

  if not found then
    raise exception 'Ride not found';
  end if;

  if ride_driver_id = auth.uid() then
    raise exception 'You cannot book your own ride';
  end if;

  if ride_status not in ('published', 'full') then
    raise exception 'Ride is not bookable';
  end if;

  if exists (
    select 1
    from public.bookings b
    where b.ride_id = target_ride_id
      and b.passenger_id = auth.uid()
      and b.booking_status in ('pending', 'confirmed')
  ) then
    raise exception 'You already booked this ride';
  end if;

  if available_seats < requested_seats then
    raise exception 'Not enough seats available';
  end if;

  insert into public.bookings (ride_id, passenger_id, seats_reserved, pickup_note, booking_status)
  values (target_ride_id, auth.uid(), requested_seats, nullif(btrim(requested_pickup_note), ''), 'pending')
  returning id into booking_id;

  update public.rides
  set seats_available = seats_available - requested_seats,
      status = case when seats_available - requested_seats <= 0 then 'full' else 'published' end
  where id = target_ride_id;

  return booking_id;
exception
  when unique_violation then
    raise exception 'You already booked this ride';
end;
$$;

grant execute on function public.reserve_ride_seat(uuid, integer, text) to authenticated;