# Remove Place ("Dar de baja") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Dar de baja" claim flow to each PlaceCard that stores reports in a `place_claims` table and hides places from the listing once they accumulate 3 claims.

**Architecture:** A new `place_claims` Supabase table holds one row per claim with a reason enum. A `active_places` view filters out places with ≥3 claims. The React layer follows the existing `ConfirmModal` / `addConfirmation` pattern exactly — new `RemovePlaceModal` component, new `addClaim` mutation in `usePlaces`, new `removeTarget` state in `App`.

**Tech Stack:** React 18, TypeScript, Supabase (PostgreSQL), React Query (`@tanstack/react-query`), Tailwind CSS.

## Global Constraints

- All code (variable names, type names, function names, file names) in English.
- UI text exclusively via i18n keys — never hardcode Spanish/English/Portuguese strings in components.
- No comments unless the WHY is non-obvious.
- No new dependencies.
- Do not run the dev server, lint, or commit unless a step explicitly says so.
- No Co-Authored-By lines in commit messages.
- Minimal changes only — do not refactor surrounding code.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `db/migrations/2026-06-27_add_place_claims.sql` | DDL for `place_claims` table and `active_places` view |
| Modify | `src/types/index.ts` | Add `ClaimReason` type and `PlaceClaim` interface |
| Modify | `src/i18n/es.ts` | Add `removeModal` translations (Spanish) |
| Modify | `src/i18n/en.ts` | Add `removeModal` translations (English) |
| Modify | `src/i18n/pt.ts` | Add `removeModal` translations (Portuguese) |
| Modify | `src/hooks/usePlaces.ts` | Query `active_places`, add `addClaim` mutation |
| Create | `src/components/RemovePlaceModal.tsx` | New modal component |
| Modify | `src/components/PlaceCard.tsx` | Add `onRemove` prop and "Dar de baja" link |
| Modify | `src/components/PlacesGrid.tsx` | Thread `onRemove` prop to `PlaceCard` |
| Modify | `src/App.tsx` | Add `removeTarget` state, render `RemovePlaceModal` |

---

## Task 1: Database migration

**Files:**
- Create: `db/migrations/2026-06-27_add_place_claims.sql`

**Interfaces:**
- Produces: `place_claims` table and `active_places` view in Supabase (applied manually in the SQL editor)

- [ ] **Step 1: Create the migration file**

```sql
-- db/migrations/2026-06-27_add_place_claims.sql

create table public.place_claims (
  id          uuid primary key default gen_random_uuid(),
  place_id    uuid not null references public.places(id) on delete cascade,
  reason      text not null check (reason in ('suspicious_activity', 'permanently_closed', 'incorrect_data')),
  created_at  timestamptz not null default now()
);

create view public.active_places as
  select * from public.places
  where id not in (
    select place_id from public.place_claims
    group by place_id
    having count(*) >= 3
  );
```

- [ ] **Step 2: Apply in Supabase**

Open the Supabase SQL editor for this project and run the migration file contents. Verify:
- `place_claims` table appears in Table Editor
- `active_places` appears under Database → Views
- Querying `select * from active_places` returns the same rows as `select * from places` (no claims yet)

- [ ] **Step 3: Commit**

```bash
git add db/migrations/2026-06-27_add_place_claims.sql
git commit -m "feat: add place_claims table and active_places view"
```

---

## Task 2: Types and i18n

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/i18n/es.ts`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/pt.ts`

**Interfaces:**
- Produces:
  - `ClaimReason` — `'suspicious_activity' | 'permanently_closed' | 'incorrect_data'`
  - `PlaceClaim` — `{ id: string; place_id: string; reason: ClaimReason; created_at: string }`
  - `t.removeModal` — shape: `{ title, reason, reasons: Record<ClaimReason, string>, disclaimer, submit, cancel }`

- [ ] **Step 1: Add types to `src/types/index.ts`**

Append after the `PlaceWithCount` interface:

```ts
export type ClaimReason = 'suspicious_activity' | 'permanently_closed' | 'incorrect_data';

export interface PlaceClaim {
  id: string;
  place_id: string;
  reason: ClaimReason;
  created_at: string;
}
```

- [ ] **Step 2: Add `removeModal` to `src/i18n/es.ts`**

Append inside the exported object, after `confirmModal`:

```ts
removeModal: {
  title: 'Dar de baja este lugar',
  reason: 'Motivo',
  reasons: {
    suspicious_activity: 'Actividad sospechosa',
    permanently_closed: 'Cerrado permanentemente',
    incorrect_data: 'Datos erróneos',
  } as Record<string, string>,
  disclaimer: 'Cualquier persona puede enviar un reporte. Si un lugar acumula 3 reportes, dejará de aparecer en el listado.',
  submit: 'Enviar reporte',
  cancel: 'Cancelar',
},
```

- [ ] **Step 3: Add `removeModal` to `src/i18n/en.ts`**

Append inside the exported object, after `confirmModal`:

```ts
removeModal: {
  title: 'Report this place',
  reason: 'Reason',
  reasons: {
    suspicious_activity: 'Suspicious activity',
    permanently_closed: 'Permanently closed',
    incorrect_data: 'Incorrect information',
  } as Record<string, string>,
  disclaimer: 'Anyone can submit a report. If a place accumulates 3 reports, it will be removed from the listing.',
  submit: 'Send report',
  cancel: 'Cancel',
},
```

- [ ] **Step 4: Add `removeModal` to `src/i18n/pt.ts`**

Append inside the exported object, after `confirmModal`:

```ts
removeModal: {
  title: 'Denunciar este local',
  reason: 'Motivo',
  reasons: {
    suspicious_activity: 'Atividade suspeita',
    permanently_closed: 'Fechado permanentemente',
    incorrect_data: 'Dados incorretos',
  } as Record<string, string>,
  disclaimer: 'Qualquer pessoa pode enviar uma denúncia. Se um local acumular 3 denúncias, será removido da listagem.',
  submit: 'Enviar denúncia',
  cancel: 'Cancelar',
},
```

- [ ] **Step 5: Verify TypeScript is happy**

Because `Translations = typeof es`, adding `removeModal` to `es.ts` automatically extends the type. TypeScript will error if `en.ts` or `pt.ts` are missing the key. Check that no type errors appear in the IDE before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/i18n/es.ts src/i18n/en.ts src/i18n/pt.ts
git commit -m "feat: add ClaimReason types and removeModal i18n keys"
```

---

## Task 3: Data layer — `usePlaces` hook

**Files:**
- Modify: `src/hooks/usePlaces.ts`

**Interfaces:**
- Consumes: `ClaimReason` from `src/types/index.ts`
- Produces: `addClaim: (placeId: string, reason: ClaimReason) => Promise<void>` on `UsePlacesResult`

- [ ] **Step 1: Update `fetchAllPlaces` to query `active_places`**

In `usePlaces.ts`, change the places query from `'places'` to `'active_places'`:

```ts
async function fetchAllPlaces(): Promise<PlaceWithCount[]> {
  const { data: places, error: placesError } = await supabase
    .from('active_places')          // <-- was 'places'
    .select('*')
    .order('created_at', { ascending: false });
  if (placesError) throw placesError;

  const { data: confirmations, error: confirmError } = await supabase
    .from('confirmations')
    .select('*');
  if (confirmError) throw confirmError;

  return (places ?? []).map((place) => ({
    ...place,
    confirmations: (confirmations ?? []).filter(
      (c: Confirmation) => c.place_id === place.id,
    ),
  }));
}
```

- [ ] **Step 2: Update the `UsePlacesResult` interface**

Add `addClaim` to the interface:

```ts
interface UsePlacesResult {
  places: PlaceWithCount[];
  loading: boolean;
  error: string | null;
  addPlace: (place: Omit<Place, 'id' | 'created_at'>) => Promise<void>;
  addConfirmation: (placeId: string, action: Action, when: string) => Promise<void>;
  addClaim: (placeId: string, reason: ClaimReason) => Promise<void>;
}
```

- [ ] **Step 3: Add the `addClaim` mutation inside `usePlaces`**

Add the import for `ClaimReason` at the top of the file:

```ts
import type { Place, Confirmation, PlaceWithCount, Filters, Action, ClaimReason } from '../types';
```

Then add the mutation inside the `usePlaces` function body, after `addConfirmationMutation`:

```ts
const addClaimMutation = useMutation({
  mutationFn: async ({ placeId, reason }: { placeId: string; reason: ClaimReason }) => {
    const { error } = await supabase
      .from('place_claims')
      .insert({ place_id: placeId, reason });
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['places'] });
  },
});
```

- [ ] **Step 4: Expose `addClaim` on the return value**

In the `return` block, add:

```ts
addClaim: async (placeId, reason) => { await addClaimMutation.mutateAsync({ placeId, reason }); },
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePlaces.ts
git commit -m "feat: query active_places and add addClaim mutation"
```

---

## Task 4: `RemovePlaceModal` component

**Files:**
- Create: `src/components/RemovePlaceModal.tsx`

**Interfaces:**
- Consumes:
  - `PlaceWithCount` from `src/types/index.ts`
  - `ClaimReason` from `src/types/index.ts`
  - `Translations` from `src/i18n/index.ts`
  - `Select` from `src/components/Select.tsx`
- Produces: `RemovePlaceModal` — props `{ place, t, onClose, onSubmit }`

- [ ] **Step 1: Create the component**

```tsx
// src/components/RemovePlaceModal.tsx
import { useState } from 'react';
import type { PlaceWithCount } from '../types';
import type { ClaimReason } from '../types';
import type { Translations } from '../i18n';
import { Select } from './Select';

const CLAIM_REASONS: ClaimReason[] = [
  'suspicious_activity',
  'permanently_closed',
  'incorrect_data',
];

const labelClass = 'font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum';

interface Props {
  place: PlaceWithCount;
  t: Translations;
  onClose: () => void;
  onSubmit: (reason: ClaimReason) => Promise<void>;
}

export function RemovePlaceModal({ place, t, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ClaimReason>('suspicious_activity');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-cream rounded-xl p-8 w-full max-w-lg shadow-xl flex flex-col gap-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-modal-title"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-petroleum" id="remove-modal-title">
            {t.removeModal.title}
          </h2>
          <p className="text-sm text-ink/65 mt-1">
            {place.name} · {place.city}
          </p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="remove-reason">
              {t.removeModal.reason}
            </label>
            <Select
              id="remove-reason"
              value={reason}
              onChange={(v) => setReason(v as ClaimReason)}
              options={CLAIM_REASONS.map((r) => ({ value: r, label: t.removeModal.reasons[r] }))}
            />
          </div>
          <p className="text-xs text-ink/50 leading-relaxed">{t.removeModal.disclaimer}</p>
          <div className="flex gap-3 justify-end mt-1">
            <button
              type="button"
              className="text-petroleum font-medium px-4 py-2.5 rounded-lg opacity-65 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onClose}
            >
              {t.removeModal.cancel}
            </button>
            <button
              type="submit"
              className="bg-petroleum text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-petroleum-dark disabled:opacity-50 transition-colors cursor-pointer"
              disabled={submitting}
            >
              {submitting ? '...' : t.removeModal.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RemovePlaceModal.tsx
git commit -m "feat: add RemovePlaceModal component"
```

---

## Task 5: Wire everything together

**Files:**
- Modify: `src/components/PlaceCard.tsx`
- Modify: `src/components/PlacesGrid.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes:
  - `RemovePlaceModal` from `src/components/RemovePlaceModal.tsx`
  - `addClaim` from `usePlaces`
  - `ClaimReason` from `src/types/index.ts`

- [ ] **Step 1: Add `onRemove` prop and "Dar de baja" link to `PlaceCard`**

Add `onRemove` to the `Props` interface:

```ts
interface Props {
  place: PlaceWithCount;
  t: Translations;
  onConfirm: (place: PlaceWithCount) => void;
  onRemove: (place: PlaceWithCount) => void;
}
```

Update the destructure:

```ts
export function PlaceCard({ place, t, onConfirm, onRemove }: Props) {
```

After the closing `</div>` of the confirm row (the `flex items-center gap-3` div), add the link:

```tsx
<button
  type="button"
  className="text-xs text-ink/35 hover:text-ink/60 transition-colors cursor-pointer mx-auto"
  onClick={() => onRemove(place)}
>
  {t.card.remove}
</button>
```

Also add the i18n key reference — add `remove: 'Dar de baja'` to the `card` object in `es.ts`, `remove: 'Report'` in `en.ts`, and `remove: 'Denunciar'` in `pt.ts`.

- [ ] **Step 2: Add `t.card.remove` to all three i18n files**

In `src/i18n/es.ts`, inside the `card` object:
```ts
remove: 'Dar de baja',
```

In `src/i18n/en.ts`, inside the `card` object:
```ts
remove: 'Report',
```

In `src/i18n/pt.ts`, inside the `card` object:
```ts
remove: 'Denunciar',
```

- [ ] **Step 3: Thread `onRemove` through `PlacesGrid`**

In `src/components/PlacesGrid.tsx`, add `onRemove` to the `Props` interface and thread it to `PlaceCard`:

```ts
interface Props {
  places: PlaceWithCount[];
  loading: boolean;
  t: Translations;
  onConfirm: (place: PlaceWithCount) => void;
  onRemove: (place: PlaceWithCount) => void;
}

export function PlacesGrid({ places, loading, t, onConfirm, onRemove }: Props) {
```

In the `places.map` call:
```tsx
<PlaceCard key={place.id} place={place} t={t} onConfirm={onConfirm} onRemove={onRemove} />
```

- [ ] **Step 4: Wire `removeTarget` state and `RemovePlaceModal` in `App.tsx`**

Add the import at the top:
```ts
import { RemovePlaceModal } from './components/RemovePlaceModal';
```

Add state after `confirmTarget`:
```ts
const [removeTarget, setRemoveTarget] = useState<PlaceWithCount | null>(null);
```

Add `addClaim` to the `usePlaces` destructure:
```ts
const { places, loading, error, addPlace, addConfirmation, addClaim } = usePlaces(filters);
```

Pass `onRemove` to `PlacesGrid`:
```tsx
<PlacesGrid places={places} loading={loading} t={t} onConfirm={setConfirmTarget} onRemove={setRemoveTarget} />
```

Add the modal render after the `ConfirmModal` block:
```tsx
{removeTarget !== null && (
  <RemovePlaceModal
    place={removeTarget}
    t={t}
    onClose={() => setRemoveTarget(null)}
    onSubmit={async (reason) => {
      await addClaim(removeTarget.id, reason);
      setRemoveTarget(null);
    }}
  />
)}
```

- [ ] **Step 5: Verify**

Check the browser:
1. Each place card shows a small "Dar de baja" / "Report" / "Denunciar" link below the confirm row, centered.
2. Clicking it opens `RemovePlaceModal` with the correct place name, dropdown, and disclaimer.
3. Selecting a reason and submitting closes the modal silently.
4. Submitting 3 claims against the same place (can use Supabase Table Editor to insert rows directly) causes that place to disappear from the listing on the next load.
5. Language toggle switches all modal text correctly.

- [ ] **Step 6: Commit**

```bash
git add src/components/PlaceCard.tsx src/components/PlacesGrid.tsx src/App.tsx src/i18n/es.ts src/i18n/en.ts src/i18n/pt.ts
git commit -m "feat: wire Dar de baja flow end-to-end"
```
