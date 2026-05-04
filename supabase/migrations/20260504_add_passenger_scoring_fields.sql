alter table public.profiles
  add column if not exists passenger_score integer not null default 100 check (passenger_score between 0 and 100),
  add column if not exists passenger_score_band text not null default 'trusted' check (passenger_score_band in ('trusted', 'watch', 'blocked')),
  add column if not exists completed_passenger_trips integer not null default 0,
  add column if not exists passenger_cancellation_count integer not null default 0,
  add column if not exists passenger_no_show_count integer not null default 0,
  add column if not exists passenger_reports_count integer not null default 0;