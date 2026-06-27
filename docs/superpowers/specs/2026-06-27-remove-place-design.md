# Remove Place ("Dar de baja") — Design Spec

Date: 2026-06-27  
Branch: feat/remove-place  
Status: Approved

---

## Overview

Community members can flag a place as problematic via a "Dar de baja" link on each `PlaceCard`. After 3 claims, the place is soft-deleted — hidden from the listing but kept in the database. Claims are stored in a new `place_claims` table with a reason per claim. No deduplication: any user may submit multiple claims.

---

## Database

### New table: `place_claims`

```sql
create table public.place_claims (
  id          uuid primary key default gen_random_uuid(),
  place_id    uuid not null references public.places(id) on delete cascade,
  reason      text not null check (reason in ('suspicious_activity', 'permanently_closed', 'incorrect_data')),
  created_at  timestamptz not null default now()
);
```

### New view: `active_places`

Filters out places that have accumulated 3 or more claims.

```sql
create view public.active_places as
  select * from public.places
  where id not in (
    select place_id from public.place_claims
    group by place_id
    having count(*) >= 3
  );
```

`fetchAllPlaces` in `usePlaces.ts` queries `active_places` instead of `places`. No other query changes.

---

## Types (`src/types/index.ts`)

```ts
export type ClaimReason = 'suspicious_activity' | 'permanently_closed' | 'incorrect_data';

export interface PlaceClaim {
  id: string;
  place_id: string;
  reason: ClaimReason;
  created_at: string;
}
```

`UsePlacesResult` gains: `addClaim: (placeId: string, reason: ClaimReason) => Promise<void>`.

---

## Data Layer (`src/hooks/usePlaces.ts`)

- Change `fetchAllPlaces` to select from `active_places` instead of `places`.
- Add `addClaimMutation`: inserts a row into `place_claims`. On success, **invalidates** the `['places']` React Query cache (triggers a refetch, naturally excluding any newly-hidden place). No optimistic update needed.
- Expose `addClaim` on the hook's return value.

---

## UI Components

### `PlaceCard.tsx`

Add a centered "Dar de baja" link below the dashed divider and confirm row. Small, muted style — visually subordinate to the "Confirmar" button. Calls a new `onRemove` prop.

```
[ ? badge ]  Sin confirmar / N confirmaciones   [ Confirmar ]
                      Dar de baja                 ← new link
```

### `RemovePlaceModal.tsx` (new)

Mirrors the structure of `ConfirmModal`. Contains:

- **Dropdown** with three options (i18n-labeled):
  - `suspicious_activity` → "Actividad sospechosa"
  - `permanently_closed` → "Cerrado permanentemente"  
  - `incorrect_data` → "Datos erróneos"
- **Disclaimer** below the dropdown (i18n string): explains that any user may report and that 3 reports hide the place from the listing.
- **"Enviar reporte"** submit button + **"Cancelar"** link.
- Silent close on success (no toast or banner).

### `PlacesGrid.tsx`

Threads the new `onRemove: (place: PlaceWithCount) => void` prop down to `PlaceCard`.

### `App.tsx`

Adds `removeTarget` state (same pattern as `confirmTarget`). Renders `RemovePlaceModal` when `removeTarget !== null`. Wires `onRemove={setRemoveTarget}` into `PlacesGrid`.

---

## i18n

All three i18n files (`es.ts`, `en.ts`, `pt.ts`) get a new `removeModal` key with:

- `title` — modal heading
- `reason` — dropdown label
- `reasons` — record mapping the three `ClaimReason` values to display strings
- `disclaimer` — policy explanation text
- `submit` — submit button label
- `cancel` — cancel label

---

## Migration file

New file: `db/migrations/2026-06-27_add_place_claims.sql`  
Contains the `create table` and `create view` statements above.

---

## Out of scope

- Admin review UI for claimed places
- Deduplication / rate limiting per user
- Notifications or email alerts on claim threshold
- Undo / retract a claim
