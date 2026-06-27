---
title: Timezone via countries FK
date: 2026-06-27
status: approved
---

## Problem

`isOpenNow` evaluates whether a place is currently open using a hardcoded `COUNTRY_TZ` map in `src/lib/hours.ts`. This map only covers 12 countries; any other country silently falls back to `America/Caracas`, producing incorrect open/closed badges for places in, say, Germany or Portugal.

Additionally, when the "Abierto ahora" filter is active with a specific country selected, the user has no indication of which timezone is being used for the open/closed evaluation.

## Goal

Store IANA timezone strings in the `countries` table and resolve a place's timezone via a proper FK relationship — eliminating the hardcoded map and making it trivially correct for every country. When "Abierto ahora" is active with a country selected, display the timezone in use next to the results count.

## Decision

- Add a `timezone text` column to `countries`
- Add a FK `places.country → countries.code`
- Fetch timezone alongside places using Supabase's nested select (`countries(timezone)`)
- Add `timezone: string | null` to the `Place` type
- When `place.timezone` is null, `isOpenNow` returns `null` (no badge shown) — same as when hours are missing
- Update `useCountries` to return `{ code: string; timezone: string | null }[]` so the timezone for the selected country filter is accessible
- When "Abierto ahora" is active and a specific country is selected, show a human-readable timezone label at the right end of the "Lugares X resultados" header row
- When "Abierto ahora" is active but country is "Todos", no label is shown (each place uses its own timezone)

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

### `src/hooks/useCountries.ts`

Change return type to `{ code: string; timezone: string | null }[]` and update the select to include `timezone`:

```ts
supabase.from('countries').select('code, timezone').eq('active', true).order('sort_order')
```

Update `FALLBACK_COUNTRIES` to match the new shape (all `timezone: null`). Callers that only need the name will use `.code`.

### `src/lib/hours.ts` — new export `formatTimezone`

Add a small helper that converts an IANA string to a human-readable Spanish label using `Intl.DateTimeFormat`:

```ts
export function formatTimezone(tz: string): string {
  return new Intl.DateTimeFormat('es', { timeZoneName: 'long', timeZone: tz })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName')?.value ?? tz;
}
```

Example output: `"hora estándar de Venezuela"`, `"hora de Europa central"`.

### `src/components/PlacesGrid.tsx` (or wherever the "Lugares X resultados" header is rendered)

When `filters.openNow === true && filters.country !== ''`, look up the timezone for `filters.country` from the countries list and render a right-aligned label:

```tsx
<span className="text-sm text-ink/45 font-mono">
  🕐 {formatTimezone(countryTimezone)}
</span>
```

The label sits on the same row as "Lugares X resultados", right-aligned.

### Callers of `useCountries`

`Filters.tsx` and `AddPlaceModal.tsx` currently map over the `string[]`. After the change they map over `{ code, timezone }[]` and use `.code` for display and value.

## Files Touched

| File | Change |
|------|--------|
| `db/migrations/2026-06-27_add_timezone_to_countries.sql` | New migration |
| `src/types/index.ts` | Add `timezone` field to `Place` |
| `src/hooks/usePlaces.ts` | Nested select + flatten |
| `src/hooks/useCountries.ts` | Return `{ code, timezone }[]`, select timezone |
| `src/lib/hours.ts` | Remove hardcoded map, update `isOpenNow`, add `formatTimezone` |
| `src/data/seed.ts` | Add `timezone: null` to each seed place |
| `src/components/PlacesGrid.tsx` | Timezone label in header row |
| `src/components/Filters.tsx` | Update to use `.code` from new shape |
| `src/components/AddPlaceModal.tsx` | Update to use `.code` from new shape |

## Out of Scope

- `AddPlaceModal` insert logic — no change; the FK enforces validity at DB level
- i18n — `formatTimezone` produces its own localised string via `Intl`; no translation keys needed
