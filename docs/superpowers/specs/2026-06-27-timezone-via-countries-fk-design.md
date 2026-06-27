---
title: Timezone via countries FK
date: 2026-06-27
status: approved
---

## Problem

`isOpenNow` evaluates whether a place is currently open using a hardcoded `COUNTRY_TZ` map in `src/lib/hours.ts`. This map only covers 12 countries; any other country silently falls back to `America/Caracas`, producing incorrect open/closed badges for places in, say, Germany or Portugal.

## Goal

Store IANA timezone strings in the `countries` table and resolve a place's timezone via a proper FK relationship — eliminating the hardcoded map and making it trivially correct for every country.

## Decision

- Add a `timezone text` column to `countries`
- Add a FK `places.country → countries.code`
- Fetch timezone alongside places using Supabase's nested select (`countries(timezone)`)
- Add `timezone: string | null` to the `Place` type
- When `place.timezone` is null, `isOpenNow` returns `null` (no badge shown) — same as when hours are missing

## Database Migration (`db/migrations/2026-06-27_add_timezone_to_countries.sql`)

```sql
-- 1. Add column
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS timezone text;

-- 2. Backfill from the current hardcoded COUNTRY_TZ map
UPDATE public.countries SET timezone = 'Europe/Madrid'                       WHERE code = 'España';
UPDATE public.countries SET timezone = 'America/Santiago'                    WHERE code = 'Chile';
UPDATE public.countries SET timezone = 'America/Argentina/Buenos_Aires'      WHERE code = 'Argentina';
UPDATE public.countries SET timezone = 'America/Montevideo'                  WHERE code = 'Uruguay';
UPDATE public.countries SET timezone = 'America/Mexico_City'                 WHERE code = 'México';
UPDATE public.countries SET timezone = 'America/Bogota'                      WHERE code = 'Colombia';
UPDATE public.countries SET timezone = 'America/Caracas'                     WHERE code = 'Venezuela';
UPDATE public.countries SET timezone = 'America/Lima'                        WHERE code = 'Perú';
UPDATE public.countries SET timezone = 'America/Guayaquil'                   WHERE code = 'Ecuador';
UPDATE public.countries SET timezone = 'America/Sao_Paulo'                   WHERE code = 'Brasil';
UPDATE public.countries SET timezone = 'America/Panama'                      WHERE code = 'Panamá';
UPDATE public.countries SET timezone = 'America/New_York'                    WHERE code = 'Estados Unidos';

-- 3. FK (safe: all existing places.country values match countries.code)
ALTER TABLE public.places
  ADD CONSTRAINT fk_places_country
  FOREIGN KEY (country) REFERENCES public.countries(code);
```

## Application Changes

### `src/types/index.ts`

Add `timezone: string | null` to the `Place` interface.

### `src/hooks/usePlaces.ts`

Change the places select to include the nested countries timezone:

```ts
supabase.from('places').select('*, countries(timezone)').order('created_at', { ascending: false })
```

Flatten the nested field before returning each place:

```ts
return (places ?? []).map((place) => ({
  ...place,
  timezone: (place as any).countries?.timezone ?? null,
  confirmations: ...,
}));
```

### `src/lib/hours.ts`

- Delete `COUNTRY_TZ`, `DEFAULT_TZ`, and `timezoneFor`
- Update `isOpenNow` to use `place.timezone` directly:

```ts
export function isOpenNow(place: Place, now: Date = new Date()): boolean | null {
  if (!place.hours || Object.keys(place.hours).length === 0) return null;
  if (!place.timezone) return null;
  const { day, minutes } = localParts(place.timezone, now);
  const range = place.hours[day];
  if (!range) return false;
  return isRangeOpen(range, minutes);
}
```

### `src/data/seed.ts`

Add `timezone: null` to each entry in `SEED_PLACES` (seed data is shown when DB is unavailable; no open/closed badge is acceptable in that state).

## Files Touched

| File | Change |
|------|--------|
| `db/migrations/2026-06-27_add_timezone_to_countries.sql` | New migration |
| `src/types/index.ts` | Add `timezone` field to `Place` |
| `src/hooks/usePlaces.ts` | Nested select + flatten |
| `src/lib/hours.ts` | Remove hardcoded map, update `isOpenNow` |
| `src/data/seed.ts` | Add `timezone: null` to each seed place |

## Out of Scope

- `useCountries` hook — not changed; it only returns country names for the filter dropdown
- `AddPlaceModal` — no change; places are inserted with `country` as a string; FK enforces validity at DB level
- i18n — no change
