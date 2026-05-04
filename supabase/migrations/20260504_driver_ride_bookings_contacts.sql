create or replace function public.get_driver_ride_bookings()
returns table (
  id uuid,
  ride_id uuid,
  passenger_id uuid,
  passenger_name text,
  passenger_phone text,
  passenger_email text,
  seats_reserved integer,
  pickup_note text,
  booking_status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    b.id,
    b.ride_id,
    b.passenger_id,
    p.full_name as passenger_name,
    p.phone as passenger_phone,
    au.email::text as passenger_email,
    b.seats_reserved,
    b.pickup_note,
    b.booking_status,
    b.created_at
  from public.bookings b
  join public.rides r on r.id = b.ride_id
  join public.profiles p on p.id = b.passenger_id
  left join auth.users au on au.id = b.passenger_id
  where r.driver_id = auth.uid()
  order by r.departure_at asc, b.created_at asc;
$$;

grant execute on function public.get_driver_ride_bookings() to authenticated;