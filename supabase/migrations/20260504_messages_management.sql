alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy "conversations_select_participant"
  on public.conversations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = conversations.id
        and cp.profile_id = auth.uid()
    )
  );

create policy "conversation_participants_select_participant"
  on public.conversation_participants
  for select
  to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1
      from public.conversation_participants mine
      where mine.conversation_id = conversation_participants.conversation_id
        and mine.profile_id = auth.uid()
    )
  );

create policy "messages_select_participant"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.profile_id = auth.uid()
    )
  );

create policy "messages_insert_participant"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.profile_id = auth.uid()
    )
  );

create or replace function public.get_my_conversations()
returns table (
  id uuid,
  ride_id uuid,
  counterpart_id uuid,
  counterpart_name text,
  counterpart_avatar_url text,
  route text,
  role text,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    c.ride_id,
    other.profile_id as counterpart_id,
    p.full_name as counterpart_name,
    p.avatar_url as counterpart_avatar_url,
    concat_ws(' -> ', r.origin, r.destination) as route,
    case when r.driver_id = auth.uid() then 'passenger' else 'driver' end as role,
    latest.body as last_message,
    latest.created_at as last_message_at,
    c.created_at
  from public.conversation_participants mine
  join public.conversations c on c.id = mine.conversation_id
  left join public.conversation_participants other
    on other.conversation_id = c.id
   and other.profile_id <> auth.uid()
  left join public.profiles p on p.id = other.profile_id
  left join public.rides r on r.id = c.ride_id
  left join lateral (
    select m.body, m.created_at
    from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) latest on true
  where mine.profile_id = auth.uid()
  order by coalesce(latest.created_at, c.created_at) desc;
$$;

create or replace function public.get_conversation_messages(target_conversation_id uuid)
returns table (
  id uuid,
  conversation_id uuid,
  sender_id uuid,
  sender_name text,
  body text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    m.id,
    m.conversation_id,
    m.sender_id,
    p.full_name as sender_name,
    m.body,
    m.created_at
  from public.messages m
  join public.profiles p on p.id = m.sender_id
  where m.conversation_id = target_conversation_id
    and exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = target_conversation_id
        and cp.profile_id = auth.uid()
    )
  order by m.created_at asc;
$$;

create or replace function public.ensure_conversation_for_booking(target_ride_id uuid, target_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_conversation_id uuid;
  is_allowed boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if target_profile_id = auth.uid() then
    raise exception 'Cannot create a conversation with yourself';
  end if;

  select exists (
    select 1
    from public.rides r
    join public.bookings b on b.ride_id = r.id
    where r.id = target_ride_id
      and (
        (r.driver_id = auth.uid() and b.passenger_id = target_profile_id)
        or (b.passenger_id = auth.uid() and r.driver_id = target_profile_id)
      )
  ) into is_allowed;

  if not is_allowed then
    raise exception 'You are not allowed to open this conversation';
  end if;

  select c.id
  into resolved_conversation_id
  from public.conversations c
  join public.conversation_participants mine
    on mine.conversation_id = c.id
   and mine.profile_id = auth.uid()
  join public.conversation_participants other
    on other.conversation_id = c.id
   and other.profile_id = target_profile_id
  where c.ride_id = target_ride_id
  limit 1;

  if resolved_conversation_id is not null then
    return resolved_conversation_id;
  end if;

  insert into public.conversations (ride_id)
  values (target_ride_id)
  returning id into resolved_conversation_id;

  insert into public.conversation_participants (conversation_id, profile_id)
  values (resolved_conversation_id, auth.uid()), (resolved_conversation_id, target_profile_id);

  return resolved_conversation_id;
end;
$$;

create or replace function public.send_message(target_conversation_id uuid, message_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_message_id uuid;
  trimmed_body text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  trimmed_body := btrim(message_body);

  if trimmed_body is null or trimmed_body = '' then
    raise exception 'Message body is required';
  end if;

  if not exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = target_conversation_id
      and cp.profile_id = auth.uid()
  ) then
    raise exception 'You are not allowed to post in this conversation';
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (target_conversation_id, auth.uid(), trimmed_body)
  returning id into new_message_id;

  return new_message_id;
end;
$$;

grant execute on function public.get_my_conversations() to authenticated;
grant execute on function public.get_conversation_messages(uuid) to authenticated;
grant execute on function public.ensure_conversation_for_booking(uuid, uuid) to authenticated;
grant execute on function public.send_message(uuid, text) to authenticated;