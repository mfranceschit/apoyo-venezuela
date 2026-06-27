# Timezone via Countries FK — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `COUNTRY_TZ` map in `hours.ts` with a `timezone` column on the `countries` table (enforced by FK), and show a human-readable timezone label next to the results count when "Abierto ahora" is active.

**Architecture:** A pre-flighted SQL migration adds `timezone` to `countries` and a FK from `places.country → countries.code`. The Supabase places query gains a nested `countries(timezone)` select; the result is flattened onto the `Place` type. `App.tsx` derives the selected country's timezone from the countries list and renders it in the header row.

**Tech Stack:** React 19, TypeScript 5, Supabase JS v2, Vite 8, Tailwind CSS 4, `Intl.DateTimeFormat` (built-in).

## Global Constraints

- Node commands must be run via `fnm exec -- <command>` (fnm is the version manager; `node` is not on PATH directly)
- No test infrastructure — use `fnm exec -- pnpm tsc --noEmit` as the verification step after each task
- Do not run `pnpm dev`, `pnpm build`, or lint commands
- Do not commit unless a step explicitly says to commit
- No Co-Authored-By lines in commit messages

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `db/migrations/2026-06-27_add_timezone_to_countries.sql` | Create | SQL migration with pre-flight check, backfill, FK |
| `src/types/index.ts` | Modify | Add `timezone: string \| null` to `Place`; add `CountryInfo` type |
| `src/lib/hours.ts` | Modify | Remove `COUNTRY_TZ`/`timezoneFor`; update `isOpenNow`; add `formatTimezone` |
| `src/data/seed.ts` | Modify | Add `timezone: null` to all 17 seed entries |
| `src/hooks/usePlaces.ts` | Modify | Nested select `countries(timezone)` + flatten onto place |
| `src/hooks/useCountries.ts` | Modify | Return `CountryInfo[]` instead of `string[]` |
| `src/App.tsx` | Modify | Map country names for child components; derive + render timezone label |

---

## Task 1: DB Migration

**Files:**
- Create: `db/migrations/2026-06-27_add_timezone_to_countries.sql`

**Interfaces:**
- Produces: `countries.timezone text` column; FK `fk_places_country` on `places.country → countries.code`

- [ ] **Step 1: Create the migration file**

```sql
BEGIN;

-- Pre-flight: abort if any places.country value has no matching countries.code.
-- If this raises, the transaction rolls back and nothing is changed.
DO $$
DECLARE
  orphans text;
BEGIN
  SELECT string_agg(DISTINCT p.country, ', ' ORDER BY p.country)
    INTO orphans
    FROM public.places p
   WHERE NOT EXISTS (
     SELECT 1 FROM public.countries c WHERE c.code = p.country
   );

  IF orphans IS NOT NULL THEN
    RAISE EXCEPTION
      'Migration aborted — places.country values not in countries.code: [%]. '
      'Insert missing rows into countries before re-running.',
      orphans;
  END IF;
END $$;

-- 1. Add timezone column (idempotent)
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS timezone text;

-- 2. Backfill from the current hardcoded COUNTRY_TZ map
UPDATE public.countries SET timezone = 'Europe/Madrid'                  WHERE code = 'España';
UPDATE public.countries SET timezone = 'America/Santiago'               WHERE code = 'Chile';
UPDATE public.countries SET timezone = 'America/Argentina/Buenos_Aires' WHERE code = 'Argentina';
UPDATE public.countries SET timezone = 'America/Montevideo'             WHERE code = 'Uruguay';
UPDATE public.countries SET timezone = 'America/Mexico_City'            WHERE code = 'México';
UPDATE public.countries SET timezone = 'America/Bogota'                 WHERE code = 'Colombia';
UPDATE public.countries SET timezone = 'America/Caracas'                WHERE code = 'Venezuela';
UPDATE public.countries SET timezone = 'America/Lima'                   WHERE code = 'Perú';
UPDATE public.countries SET timezone = 'America/Guayaquil'              WHERE code = 'Ecuador';
UPDATE public.countries SET timezone = 'America/Sao_Paulo'              WHERE code = 'Brasil';
UPDATE public.countries SET timezone = 'America/Panama'                 WHERE code = 'Panamá';
UPDATE public.countries SET timezone = 'America/New_York'               WHERE code = 'Estados Unidos';

-- 3. FK constraint (safe: pre-flight guarantees no orphans at this point)
ALTER TABLE public.places
  ADD CONSTRAINT fk_places_country
  FOREIGN KEY (country) REFERENCES public.countries(code);

COMMIT;
```

- [ ] **Step 2: Commit**

```bash
git add db/migrations/2026-06-27_add_timezone_to_countries.sql
git commit -m "feat: add timezone column to countries and FK from places.country"
```

---

## Task 2: Core types, hours.ts, seed.ts

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/hours.ts`
- Modify: `src/data/seed.ts`

**Interfaces:**
- Consumes: nothing new
- Produces:
  - `Place.timezone: string | null` (used by `isOpenNow` and Task 3/4)
  - `CountryInfo: { code: string; timezone: string | null }` (used by Task 4)
  - `isOpenNow(place: Place, now?: Date): boolean | null` — unchanged signature, uses `place.timezone` internally
  - `formatTimezone(tz: string): string` — converts IANA string to Spanish label (used by Task 4)

- [ ] **Step 1: Add `timezone` and `CountryInfo` to `src/types/index.ts`**

Replace the `Place` interface and add `CountryInfo` after the existing types:

```ts
export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  city: string;
  country: string;
  address: string | null;
  url: string | null;
  hours: Hours | null;
  timezone: string | null;
  created_at: string;
}

export interface CountryInfo {
  code: string;
  timezone: string | null;
}
```

- [ ] **Step 2: Rewrite `src/lib/hours.ts`**

Replace the entire file content:

```ts
import type { DayKey, DayRange, Hours, Place } from '../types';

export const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const WEEKDAY_TO_KEY: Record<string, DayKey> = {
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
  Sun: 'sun',
};

/** Current weekday + minutes-since-midnight in the given timezone. */
function localParts(tz: string, now: Date): { day: DayKey; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';

  let h = parseInt(hour, 10);
  if (h === 24) h = 0;
  return { day: WEEKDAY_TO_KEY[weekday] ?? 'mon', minutes: h * 60 + parseInt(minute, 10) };
}

/** 'HH:MM' -> minutes since midnight. '24:00' -> 1440. */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  return h * 60 + (m || 0);
}

export function isRangeOpen(range: DayRange, minutes: number): boolean {
  const open = toMinutes(range[0]);
  const close = toMinutes(range[1]);
  if (close > open) return minutes >= open && minutes < close;
  return minutes >= open || minutes < close;
}

/**
 * Is the place open right now in its local timezone?
 * Returns null when hours or timezone are missing (can't determine open/closed).
 */
export function isOpenNow(place: Place, now: Date = new Date()): boolean | null {
  if (!place.hours || Object.keys(place.hours).length === 0) return null;
  if (!place.timezone) return null;
  const { day, minutes } = localParts(place.timezone, now);
  const range = place.hours[day];
  if (!range) return false;
  return isRangeOpen(range, minutes);
}

/** Group consecutive days (mon→sun) that share an identical range, for compact display. */
export function summarizeHours(hours: Hours): { days: DayKey[]; range: DayRange }[] {
  const groups: { days: DayKey[]; range: DayRange }[] = [];
  for (const day of DAY_ORDER) {
    const range = hours[day];
    if (!range) continue;
    const last = groups[groups.length - 1];
    if (last && last.range[0] === range[0] && last.range[1] === range[1]) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], range: [...range] });
    }
  }
  return groups;
}

export function is24h(range: DayRange): boolean {
  return toMinutes(range[0]) === 0 && toMinutes(range[1]) >= 1440;
}

/** Converts an IANA timezone string to a human-readable Spanish label. */
export function formatTimezone(tz: string): string {
  return (
    new Intl.DateTimeFormat('es', {
      timeZoneName: 'longGeneric',
      timeZone: tz,
    })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value ?? tz
  );
}
```

- [ ] **Step 3: Add `timezone: null` to all 17 entries in `src/data/seed.ts`**

Each object in `SEED_PLACES` needs `timezone: null` added. Add it after `hours` in every entry:

```ts
// seed-01
  hours: { sat: ['10:00', '18:30'], sun: ['10:00', '18:30'] },
  timezone: null,
  created_at: '2026-06-24T00:00:00Z',

// seed-02 through seed-15, seed-16, seed-17 — same pattern:
  hours: null,
  timezone: null,
  created_at: '2026-06-24T00:00:00Z',
```

Apply `timezone: null` to all 17 entries (seed-01 through seed-17).

- [ ] **Step 4: Verify TypeScript compiles**

```bash
fnm exec -- pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/lib/hours.ts src/data/seed.ts
git commit -m "feat: add timezone to Place type, remove hardcoded COUNTRY_TZ map"
```

---

## Task 3: usePlaces — nested select + flatten

**Files:**
- Modify: `src/hooks/usePlaces.ts`
- Modify: `src/components/AddPlaceModal.tsx`

**Interfaces:**
- Consumes: `Place.timezone: string | null` from Task 2
- Produces:
  - Each `PlaceWithCount` returned from `fetchAllPlaces` has `timezone` populated from the joined `countries` row
  - `addPlace` accepts `Omit<Place, 'id' | 'created_at' | 'timezone'>` (timezone is DB-managed, not user-supplied)

- [ ] **Step 1: Update the places select, flatten timezone, and fix omit types in `src/hooks/usePlaces.ts`**

Three changes in this file:

**1a.** Update `fetchAllPlaces` — replace the places query and the map:

```ts
async function fetchAllPlaces(): Promise<PlaceWithCount[]> {
  const { data: places, error: placesError } = await supabase
    .from('places')
    .select('*, countries(timezone)')
    .order('created_at', { ascending: false });
  if (placesError) throw placesError;

  const { data: confirmations, error: confirmError } = await supabase
    .from('confirmations')
    .select('*');
  if (confirmError) throw confirmError;

  return (places ?? []).map((place) => ({
    ...place,
    timezone: (place as { countries?: { timezone?: string | null } }).countries?.timezone ?? null,
    confirmations: (confirmations ?? []).filter(
      (c: Confirmation) => c.place_id === place.id,
    ),
  }));
}
```

**1b.** In `UsePlacesResult`, change the `addPlace` signature:

```ts
addPlace: (place: Omit<Place, 'id' | 'created_at' | 'timezone'>) => Promise<void>;
```

**1c.** In `addPlaceMutation`, change the `mutationFn` parameter type to match:

```ts
mutationFn: async (place: Omit<Place, 'id' | 'created_at' | 'timezone'>) => {
```

- [ ] **Step 2: Fix the matching type in `src/components/AddPlaceModal.tsx`**

In the `Props` interface, update `onSubmit`:

```ts
onSubmit: (place: Omit<Place, 'id' | 'created_at' | 'timezone'>) => Promise<void>;
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
fnm exec -- pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/usePlaces.ts src/components/AddPlaceModal.tsx
git commit -m "feat: include timezone from countries join in places query"
```

---

## Task 4: useCountries + timezone label in App.tsx

**Files:**
- Modify: `src/hooks/useCountries.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes:
  - `CountryInfo: { code: string; timezone: string | null }` from Task 2 (`src/types/index.ts`)
  - `formatTimezone(tz: string): string` from Task 2 (`src/lib/hours.ts`)
- Produces: `useCountries(): CountryInfo[]`; timezone label rendered in header when `filters.openNow && filters.country !== ''`

- [ ] **Step 1: Rewrite `src/hooks/useCountries.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { CountryInfo } from '../types';

const FALLBACK_COUNTRIES: CountryInfo[] = [
  { code: 'Alemania', timezone: null },
  { code: 'Argentina', timezone: null },
  { code: 'Bélgica', timezone: null },
  { code: 'Bolivia', timezone: null },
  { code: 'Brasil', timezone: null },
  { code: 'Canadá', timezone: null },
  { code: 'Chile', timezone: null },
  { code: 'Colombia', timezone: null },
  { code: 'Ecuador', timezone: null },
  { code: 'España', timezone: null },
  { code: 'Estados Unidos', timezone: null },
  { code: 'Francia', timezone: null },
  { code: 'Grecia', timezone: null },
  { code: 'Guatemala', timezone: null },
  { code: 'Honduras', timezone: null },
  { code: 'Italia', timezone: null },
  { code: 'México', timezone: null },
  { code: 'Países Bajos', timezone: null },
  { code: 'Perú', timezone: null },
  { code: 'Polonia', timezone: null },
  { code: 'Portugal', timezone: null },
  { code: 'Reino Unido', timezone: null },
  { code: 'República Dominicana', timezone: null },
  { code: 'Suecia', timezone: null },
  { code: 'Uruguay', timezone: null },
  { code: 'Venezuela', timezone: null },
];

async function fetchCountries(): Promise<CountryInfo[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('code, timezone')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: { code: string; timezone: string | null }) => ({
    code: r.code,
    timezone: r.timezone,
  }));
}

export function useCountries(): CountryInfo[] {
  const { data } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    retry: 1,
  });
  return data ?? FALLBACK_COUNTRIES;
}
```

- [ ] **Step 2: Update `src/App.tsx`**

Three changes in `App.tsx`:

**2a.** Add `formatTimezone` to the `hours` import at the top:

```ts
import { formatTimezone } from './lib/hours';
```

**2b.** Derive `countryNames` and `selectedTimezone` from the countries list, just before the `return` statement:

```ts
const countryNames = countries.map((c) => c.code);
const selectedTimezone =
  filters.openNow && filters.country
    ? (countries.find((c) => c.code === filters.country)?.timezone ?? null)
    : null;
```

**2c.** Pass `countryNames` (not `countries`) to `FilterBar` and `AddPlaceModal`, and add the timezone label to the header row.

Replace the results header div (currently lines 56–61):

```tsx
<div className="flex items-baseline gap-4 mb-8 border-b-2 border-ink pb-3">
  <h2 className="font-display text-2xl font-bold text-ink">{t.section.title}</h2>
  <span className="font-mono text-xs text-ink/45">
    {t.section.results(places.length)}
  </span>
  {selectedTimezone && (
    <span className="ml-auto font-mono text-xs text-ink/45">
      🕐 {formatTimezone(selectedTimezone)}
    </span>
  )}
</div>
```

Replace `countries={countries}` with `countries={countryNames}` in both the `<FilterBar>` and `<AddPlaceModal>` JSX.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
fnm exec -- pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCountries.ts src/App.tsx
git commit -m "feat: show timezone label when filtering by open now with a country selected"
```
