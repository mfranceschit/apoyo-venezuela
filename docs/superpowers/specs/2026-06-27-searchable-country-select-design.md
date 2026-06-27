# Searchable Country Select (ComboBox) — Design Spec

**Date:** 2026-06-27  
**Branch:** `styles/country-dropdown-searchable`

## Goal

Create a `ComboBox` component that behaves like the existing `Select` component but replaces the button trigger with a text input, allowing users to filter the list by typing. All visual styles from `Select` are preserved exactly.

## Scope

- New file: `src/components/ComboBox.tsx`
- Replace `<Select>` with `<ComboBox>` in `Filters.tsx` (country filter) and `AddPlaceModal.tsx` (country field only)
- No changes to `Select.tsx` or any non-country Select usage

## Component API

Same interface as `Select`, drop-in compatible, with one addition:

```ts
interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];       // reuse SelectOption from Select.tsx
  id?: string;
  ariaLabel?: string;
  className?: string;
  placeholder?: string;          // shown in input when nothing selected
}
```

## Architecture

### Trigger

An `<input type="text">` styled identically to the Select button:

```
px-3 py-2 border border-ink/15 rounded-lg bg-white text-ink
hover:border-petroleum/40
focus:outline-none focus:border-petroleum focus:ring-2 focus:ring-petroleum/15
transition-colors
```

The chevron SVG sits absolutely at the right edge (same as Select, rotates when open, `pointer-events-none`).

### State

| State | Type | Purpose |
|-------|------|---------|
| `open` | `boolean` | Controls dropdown visibility |
| `query` | `string` | Current text in the input |
| `active` | `number` | Highlighted option index (keyboard nav) |

### Display value in input

- Closed + no query typed → shows `selected.label`
- Typing → shows `query`
- On blur without selection → reverts to `selected.label` (or empty if no value)

### Filtering

`filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))`

Applied only when `query` is non-empty. Full list shown when query is empty.

### Dropdown list

Identical markup and classes to `Select`:

```
absolute z-50 mt-1.5 w-full max-h-64 overflow-auto
rounded-xl border border-ink/10 bg-white py-1 shadow-xl shadow-ink/10
```

Items: same `bg-petroleum/10` hover, `text-petroleum font-semibold` + `✓` for selected.

### Interactions

| Event | Behavior |
|-------|----------|
| Focus input | Open dropdown, show full list |
| Type in input | Filter list, keep dropdown open, reset `active` to 0 |
| ArrowDown / ArrowUp | Navigate list; open if closed |
| Enter | Select `filtered[active]`, reset query, close |
| Escape | Close, revert input to selected label |
| Click option | Select, reset query, close |
| Click outside | Close, revert input to selected label |
| Chevron click | Toggle open/closed |

### Scroll-into-view

Same pattern as Select: `useEffect` watches `active` + `open`, calls `scrollIntoView({ block: 'nearest' })` on the active `<li>`.

## Callers updated

| File | Change |
|------|--------|
| `src/components/Filters.tsx` | `import { ComboBox }` + replace `<Select>` for country |
| `src/components/AddPlaceModal.tsx` | `import { ComboBox }` + replace `<Select id="add-country">` |

## Error handling

None needed — this is a purely presentational, controlled component. Options are always provided by the parent.

## Testing

No automated tests exist in this project. Manual verification: type a partial country name, confirm the list filters; select with mouse and keyboard; confirm Escape reverts; confirm blur without selection reverts to prior value.
