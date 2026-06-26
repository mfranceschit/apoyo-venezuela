-- Adds structured opening hours to places and backfills known schedules.
-- Run this in the Supabase SQL editor (DDL requires elevated privileges; the
-- anon key cannot ALTER TABLE).
--
-- Format of `hours` (jsonb): a weekly schedule keyed by day. A missing day means
-- closed. Times are 'HH:MM' (24h); '24:00' means end of day. NULL = not reported.
--   {"mon":["08:00","20:00"], "sat":["10:00","18:00"], ...}

alter table public.places
  add column if not exists hours jsonb;

-- Backfill the places we have confirmed schedules for, and strip the schedule
-- text that used to be embedded in `address` (it now lives in `hours`).

update public.places
set hours = '{"sat":["10:00","18:30"],"sun":["10:00","18:30"]}'::jsonb,
    address = 'Planta 0, Sambil Madrid'
where name = 'Sambil Madrid';

update public.places
set hours = '{"mon":["10:00","19:00"],"tue":["10:00","19:00"],"wed":["10:00","19:00"],"thu":["10:00","19:00"],"fri":["10:00","19:00"],"sat":["10:00","16:00"]}'::jsonb
where name = 'Yum Express';

update public.places
set hours = '{"mon":["13:00","19:00"],"tue":["13:00","19:00"],"wed":["13:00","19:00"],"thu":["13:00","19:00"],"fri":["13:00","19:00"],"sat":["13:00","19:00"],"sun":["13:00","19:00"]}'::jsonb,
    address = 'Amenábar 1024, Colegiales'
where name = 'Amenábar 1024 — Colegiales';

update public.places
set hours = '{"mon":["10:00","21:00"],"tue":["10:00","21:00"],"wed":["10:00","21:00"],"thu":["10:00","21:00"],"fri":["10:00","21:00"],"sat":["10:00","21:00"],"sun":["10:00","21:00"]}'::jsonb,
    address = 'Libertad 996, Retiro'
where name = 'Libertad 996 — Retiro';

update public.places
set hours = '{"mon":["08:00","20:00"],"tue":["08:00","20:00"],"wed":["08:00","20:00"],"thu":["08:00","20:00"],"fri":["08:00","20:00"],"sat":["10:00","18:00"],"sun":["10:00","18:00"]}'::jsonb,
    address = 'Av. Apoquindo 4100, of. 512, E&M Odontología, Las Condes · +56 9 3121 6179'
where name = 'E&M Odontología — Las Condes';

update public.places
set hours = '{"mon":["00:00","24:00"],"tue":["00:00","24:00"],"wed":["00:00","24:00"],"thu":["00:00","24:00"],"fri":["00:00","24:00"],"sat":["00:00","24:00"],"sun":["00:00","24:00"]}'::jsonb,
    address = 'Av. Apoquindo 4411, galería sur del subcentro Metro Escuela Militar, local 175, Las Condes · +56 9 7538 2342'
where name = 'Galería Sur Metro Escuela Militar — Local 175';
