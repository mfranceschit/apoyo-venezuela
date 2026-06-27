-- db/migrations/2026-06-27_add_place_claims.sql

create table public.place_claims (
  id          uuid primary key default gen_random_uuid(),
  place_id    uuid not null references public.places(id) on delete cascade,
  reason      text not null check (reason in ('suspicious_activity', 'permanently_closed', 'incorrect_data')),
  created_at  timestamptz not null default now()
);

alter table public.place_claims enable row level security;

create policy "anon can read place_claims"
  on public.place_claims
  for select
  to anon
  using (true);

create policy "anon can insert place_claims"
  on public.place_claims
  for insert
  to anon
  with check (true);

create view public.active_places as
  select * from public.places
  where id not in (
    select place_id from public.place_claims
    group by place_id
    having count(*) >= 3
  );

grant select on public.active_places to anon;
