create table public.profiles (
  id uuid primary key,
  full_name text not null,
  avatar_url text,
  phone text,
  home_city text not null default 'Jose Ignacio',
  role text not null check (role in ('rider', 'driver', 'admin')),
  rating numeric(2,1) not null default 5.0,
  completed_rides integer not null default 0,
  passenger_score integer not null default 100 check (passenger_score between 0 and 100),
  passenger_score_band text not null default 'trusted' check (passenger_score_band in ('trusted', 'watch', 'blocked')),
  completed_passenger_trips integer not null default 0,
  passenger_cancellation_count integer not null default 0,
  passenger_no_show_count integer not null default 0,
  passenger_reports_count integer not null default 0,
  is_identity_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  brand text not null,
  model text not null,
  color text,
  plate_number text not null unique,
  seats integer not null check (seats between 1 and 8),
  luggage_policy text,
  insurance_provider text,
  insurance_policy_number text,
  insurance_expires_at timestamptz,
  insurance_document_path text,
  created_at timestamptz not null default now()
);

create table public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  origin text not null,
  destination text not null,
  departure_at timestamptz not null,
  arrival_estimate_at timestamptz,
  seat_price_uyu integer not null check (seat_price_uyu > 0),
  seats_total integer not null check (seats_total between 1 and 8),
  seats_available integer not null check (seats_available >= 0),
  notes text,
  status text not null check (status in ('draft', 'published', 'full', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  seats_reserved integer not null default 1 check (seats_reserved > 0),
  booking_status text not null check (booking_status in ('pending', 'confirmed', 'cancelled', 'completed')),
  pickup_note text,
  created_at timestamptz not null default now(),
  unique (ride_id, passenger_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references public.rides(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  target_profile_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('profile', 'ride', 'message', 'booking')),
  subject_id uuid not null,
  reason text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  status text not null check (status in ('open', 'escalated', 'closed')),
  opened_by uuid references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.rides enable row level security;

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

create policy "rides_delete_own"
  on public.rides
  for delete
  to authenticated
  using (auth.uid() = driver_id);

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