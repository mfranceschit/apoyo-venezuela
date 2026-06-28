-- Recreate active_places to expose each place's timezone.
--
-- timezone lives on countries, not places. The original active_places view
-- was `select * from places`, which dropped the timezone the client needs for
-- the "Abierto ahora" (open now) filter — isOpenNow() returns null without it,
-- so the filter matched nothing. Join countries to surface timezone as a real
-- column (more reliable than PostgREST embedding through a view).
--
-- The inner join is safe: the fk_places_country constraint guarantees every
-- place's country exists in countries.

create or replace view public.active_places as
  select p.*, c.timezone
  from public.places p
  join public.countries c on c.code = p.country
  where p.id not in (
    select place_id from public.place_claims
    group by place_id
    having count(*) >= 3
  );

grant select on public.active_places to anon;
