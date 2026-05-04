create or replace function public.get_public_ride_catalog(
  filter_origin text default null,
  filter_destination text default null,
  filter_max_price integer default null,
  filter_date date default null
)
returns table (
  id uuid,
  origin text,
  destination text,
  departure_at timestamptz,
  seat_price_uyu integer,
  seats_available integer,
  status text,
  notes text,
  driver_name text,
  driver_rating numeric,
  driver_trips integer,
  car_model text
)
language sql
security definer
set search_path = public
as $$
  select
    r.id,
    r.origin,
    r.destination,
    r.departure_at,
    r.seat_price_uyu,
    r.seats_available,
    r.status,
    r.notes,
    p.full_name as driver_name,
    p.rating as driver_rating,
    p.completed_rides as driver_trips,
    concat_ws(' ', v.brand, v.model) as car_model
  from public.rides r
  join public.profiles p on p.id = r.driver_id
  join public.vehicles v on v.id = r.vehicle_id
  where r.status in ('published', 'full')
    and (filter_origin is null or filter_origin = '' or r.origin ilike '%' || filter_origin || '%')
    and (filter_destination is null or filter_destination = '' or r.destination ilike '%' || filter_destination || '%')
    and (filter_max_price is null or r.seat_price_uyu <= filter_max_price)
    and (filter_date is null or timezone('America/Montevideo', r.departure_at)::date = filter_date)
  order by r.departure_at asc;
$$;

grant execute on function public.get_public_ride_catalog(text, text, integer, date) to anon, authenticated;

insert into public.profiles (
  id,
  full_name,
  home_city,
  role,
  rating,
  completed_rides,
  is_identity_verified
)
values
  ('11111111-1111-4111-8111-111111111111', 'Lucia S.', 'Jose Ignacio', 'driver', 4.9, 128, true),
  ('22222222-2222-4222-8222-222222222222', 'Tomas R.', 'La Barra', 'driver', 4.8, 89, true),
  ('33333333-3333-4333-8333-333333333333', 'Mateo P.', 'San Carlos', 'driver', 4.7, 61, true),
  ('44444444-4444-4444-8444-444444444444', 'Camila V.', 'Jose Ignacio', 'driver', 5.0, 42, true)
on conflict (id) do update set
  full_name = excluded.full_name,
  home_city = excluded.home_city,
  role = excluded.role,
  rating = excluded.rating,
  completed_rides = excluded.completed_rides,
  is_identity_verified = excluded.is_identity_verified;

insert into public.vehicles (
  id,
  driver_id,
  brand,
  model,
  color,
  plate_number,
  seats,
  luggage_policy,
  insurance_provider,
  insurance_policy_number,
  insurance_expires_at,
  insurance_document_path
)
values
  ('aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'Suzuki', 'Vitara', 'Blanco', 'SJI-1001', 4, 'Tablas de surf OK', 'Sura', 'UY-0001', '2027-12-31T00:00:00Z', 'seed/lucia-insurance.pdf'),
  ('aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '22222222-2222-4222-8222-222222222222', 'Toyota', 'Corolla', 'Gris', 'LBR-2202', 4, 'Equipaje de mano', 'Mapfre', 'UY-0002', '2027-12-31T00:00:00Z', 'seed/tomas-insurance.pdf'),
  ('aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', '33333333-3333-4333-8333-333333333333', 'Chevrolet', 'Onix', 'Azul', 'SCR-3303', 4, 'Mochila y bolso', 'Sancor', 'UY-0003', '2027-12-31T00:00:00Z', 'seed/mateo-insurance.pdf'),
  ('aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4', '44444444-4444-4444-8444-444444444444', 'Volkswagen', 'T-Cross', 'Arena', 'MLD-4404', 5, 'Valijas medianas', 'Porto', 'UY-0004', '2027-12-31T00:00:00Z', 'seed/camila-insurance.pdf')
on conflict (id) do update set
  driver_id = excluded.driver_id,
  brand = excluded.brand,
  model = excluded.model,
  color = excluded.color,
  plate_number = excluded.plate_number,
  seats = excluded.seats,
  luggage_policy = excluded.luggage_policy,
  insurance_provider = excluded.insurance_provider,
  insurance_policy_number = excluded.insurance_policy_number,
  insurance_expires_at = excluded.insurance_expires_at,
  insurance_document_path = excluded.insurance_document_path;

insert into public.rides (
  id,
  driver_id,
  vehicle_id,
  origin,
  destination,
  departure_at,
  arrival_estimate_at,
  seat_price_uyu,
  seats_total,
  seats_available,
  notes,
  status
)
values
  ('90000001-9000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Jose Ignacio', 'Punta del Este', '2026-05-04T18:10:00-03:00', null, 320, 4, 2, 'Aire acondicionado | Tablas de surf OK | Musica tranquila', 'published'),
  ('90000002-9000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'La Barra', 'Jose Ignacio', '2026-05-05T09:00:00-03:00', null, 220, 4, 3, 'Equipaje de mano | Conversacion', 'published'),
  ('90000003-9000-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', 'aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'San Carlos', 'Jose Ignacio', '2026-05-08T07:30:00-03:00', null, 260, 4, 1, 'Trayecto al trabajo | Puntual', 'published'),
  ('90000004-9000-4000-8000-000000000004', '44444444-4444-4444-8444-444444444444', 'aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'Jose Ignacio', 'Maldonado', '2026-05-09T15:45:00-03:00', null, 350, 5, 4, 'Playa | Mascotas permitidas', 'published')
on conflict (id) do update set
  driver_id = excluded.driver_id,
  vehicle_id = excluded.vehicle_id,
  origin = excluded.origin,
  destination = excluded.destination,
  departure_at = excluded.departure_at,
  arrival_estimate_at = excluded.arrival_estimate_at,
  seat_price_uyu = excluded.seat_price_uyu,
  seats_total = excluded.seats_total,
  seats_available = excluded.seats_available,
  notes = excluded.notes,
  status = excluded.status;