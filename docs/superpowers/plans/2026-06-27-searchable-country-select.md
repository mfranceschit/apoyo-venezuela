# Searchable Country Select (ComboBox) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `ComboBox` component that looks identical to `Select` but lets users filter the option list by typing, then wire it into the two country dropdowns.

**Architecture:** A new `src/components/ComboBox.tsx` that shares the same `SelectOption` interface and visual tokens as `Select`. An `<input type="text">` replaces the `<button>` trigger; typing filters the list. Two callers swap `<Select>` for `<ComboBox>` on their country fields only.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (custom tokens: `petroleum`, `ink`, `cream`)

## Global Constraints

- Preserve every Tailwind class from `Select.tsx` — no visual regressions
- Re-use `SelectOption` exported from `src/components/Select.tsx`
- No changes to `Select.tsx`, `Select`'s other call sites, or non-country fields
- No test framework exists in the project — skip test steps

---

### Task 1: Create `ComboBox` component

**Files:**
- Create: `src/components/ComboBox.tsx`

**Interfaces:**
- Consumes: `SelectOption` from `./Select`
- Produces: `export function ComboBox(props: Props): JSX.Element`

```ts
interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  ariaLabel?: string;
  className?: string;
  placeholder?: string;
}
```

- [ ] **Step 1: Create `src/components/ComboBox.tsx`**

Write the full file:

```tsx
import { useEffect, useRef, useState } from 'react';
import type { SelectOption } from './Select';

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  ariaLabel?: string;
  className?: string;
  placeholder?: string;
}

export function ComboBox({ value, onChange, options, id, ariaLabel, className, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // When opening, highlight the current value.
  useEffect(() => {
    if (!open) return;
    const idx = filtered.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : 0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset active to 0 when query changes.
  useEffect(() => {
    setActive(0);
  }, [query]);

  // Keep highlighted option in view.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (v: string) => {
    onChange(v);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    } else if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault();
      setOpen(true);
    } else if (open && e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (open && e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (open && e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active].value);
    }
  };

  const displayValue = query || (open ? query : (selected?.label ?? ''));

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          placeholder={!open && !value ? placeholder : selected?.label}
          value={displayValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => {
            // Blur fires before mousedown on list items; let mousedown handler win.
            setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                setOpen(false);
                setQuery('');
              }
            }, 150);
          }}
          className="w-full text-sm text-left px-3 py-2 pr-8 border border-ink/15 rounded-lg bg-white text-ink hover:border-petroleum/40 focus:outline-none focus:border-petroleum focus:ring-2 focus:ring-petroleum/15 transition-colors cursor-text"
          autoComplete="off"
        />
        <span
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
          aria-hidden="true"
        >
          <svg
            className={`w-4 h-4 text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1.5 w-full max-h-64 overflow-auto rounded-xl border border-ink/10 bg-white py-1 shadow-xl shadow-ink/10"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink/40">No results</li>
          ) : (
            filtered.map((o, i) => {
              const isSelected = o.value === value;
              const isActive = i === active;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    // Prevent input blur from firing before we can select.
                    e.preventDefault();
                    choose(o.value);
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                    isActive ? 'bg-petroleum/10' : ''
                  } ${isSelected ? 'text-petroleum font-semibold' : 'text-ink'}`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected && <span className="text-petroleum text-xs shrink-0">✓</span>}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ComboBox.tsx
git commit -m "feat: add ComboBox component with searchable filtering"
```

---

### Task 2: Wire `ComboBox` into `Filters.tsx`

**Files:**
- Modify: `src/components/Filters.tsx`

**Interfaces:**
- Consumes: `ComboBox` from `./ComboBox`

- [ ] **Step 1: Update `Filters.tsx`**

Add the import and replace the country `<Select>` with `<ComboBox>`:

```tsx
// Add to imports (keep existing Select import if still used elsewhere, or remove if not)
import { ComboBox } from './ComboBox';
```

Replace the country `<Select>` (currently at the `<Select className="w-48" ...>` for country):

```tsx
<ComboBox
  className="w-48"
  ariaLabel={t.filters.country}
  value={filters.country}
  onChange={(country) => onChange({ ...filters, country })}
  options={countryOptions}
/>
```

Remove the `Select` import from `Filters.tsx` (it's no longer used there).

The full updated file:

```tsx
import type { Filters, PlaceType } from '../types';
import type { Translations } from '../i18n';
import { ComboBox } from './ComboBox';

const activeChip = 'bg-petroleum text-cream border-petroleum';
const inactiveChip = 'border border-ink/15 bg-white text-ink hover:border-petroleum/40';
const chipBase = 'text-sm px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  t: Translations;
  countries: string[];
}

export function FilterBar({ filters, onChange, t, countries }: Props) {
  const countryOptions = [
    { value: '', label: t.filters.all },
    ...countries.map((c) => ({ value: c, label: t.filters.countries[c] ?? c })),
  ];

  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum/65">
          {t.filters.country}
        </span>
        <ComboBox
          className="w-48"
          ariaLabel={t.filters.country}
          value={filters.country}
          onChange={(country) => onChange({ ...filters, country })}
          options={countryOptions}
        />
        <input
          type="search"
          className="flex-1 min-w-[180px] text-sm px-3 py-2 border border-ink/15 rounded-lg bg-white text-ink placeholder:text-ink/40 focus:outline-none focus:border-petroleum transition-colors"
          placeholder={t.filters.searchPlaceholder}
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          className={`${chipBase} ${filters.type === '' ? activeChip : inactiveChip}`}
          onClick={() => onChange({ ...filters, type: '' })}
        >
          {t.filters.all}
        </button>
        {(['collection', 'volunteering'] as PlaceType[]).map((type) => (
          <button
            key={type}
            className={`${chipBase} ${filters.type === type ? activeChip : inactiveChip}`}
            onClick={() => onChange({ ...filters, type })}
          >
            {t.filters[type]}
          </button>
        ))}

        <span className="mx-1 h-5 w-px bg-ink/15" aria-hidden="true" />

        <button
          aria-pressed={filters.confirmedOnly}
          className={`${chipBase} ${filters.confirmedOnly ? activeChip : inactiveChip}`}
          onClick={() => onChange({ ...filters, confirmedOnly: !filters.confirmedOnly })}
        >
          {t.filters.confirmedOnly}
        </button>

        <button
          aria-pressed={filters.openNow}
          className={`${chipBase} ${filters.openNow ? activeChip : inactiveChip}`}
          onClick={() => onChange({ ...filters, openNow: !filters.openNow })}
        >
          {t.filters.openNow}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Filters.tsx
git commit -m "feat: use ComboBox for country filter in FilterBar"
```

---

### Task 3: Wire `ComboBox` into `AddPlaceModal.tsx`

**Files:**
- Modify: `src/components/AddPlaceModal.tsx`

**Interfaces:**
- Consumes: `ComboBox` from `./ComboBox`

- [ ] **Step 1: Add `ComboBox` import to `AddPlaceModal.tsx`**

```tsx
import { ComboBox } from './ComboBox';
```

Keep the existing `import { Select } from './Select'` — it's still used for the type dropdown.

- [ ] **Step 2: Replace the country `<Select>` with `<ComboBox>`**

Find the block:
```tsx
<Select
  id="add-country"
  value={country}
  onChange={setCountry}
  options={countries.map((c) => ({ value: c, label: t.filters.countries[c] ?? c }))}
/>
```

Replace with:
```tsx
<ComboBox
  id="add-country"
  value={country}
  onChange={setCountry}
  options={countries.map((c) => ({ value: c, label: t.filters.countries[c] ?? c }))}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AddPlaceModal.tsx
git commit -m "feat: use ComboBox for country field in AddPlaceModal"
```
