# Apoyo Venezuela Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a community catalog SPA for the Venezuelan diaspora to find physical aid drop-off centers and volunteer opportunities in Spain, Chile, Argentina, Uruguay, and Mexico, featuring a trust-stamp system based on real-action reports (not upvotes).

**Architecture:** Vite + React + TypeScript SPA deployed to Vercel. Client-side fetch from Supabase (Postgres). No SSR. No user authentication. Places publish immediately on submission. Static seed data serves as offline fallback when Supabase is unreachable.

**Tech Stack:** Vite 8, React 19.2, TypeScript 5 (strict), @supabase/supabase-js (verify latest on npmjs.com — was 2.x as of mid-2025), TanStack Query v5 (data fetching), Tailwind CSS v4, Bun (runtime + package manager)

## Global Constraints

- TypeScript strict mode everywhere — no `any`, no `.js` source files
- All code (identifiers, comments, variable names) written in English
- UI copy in Spanish (default) and English (toggle) via i18n system — never hardcode display strings
- Colors via Tailwind `@theme`: `petroleum #1E4D5C`, `petroleum-dark #163949`, `gold #F2C75C`, `cream #FFFBF2`, `ink #2A2622`, `terracotta #C75C3C`
- Fonts via Tailwind `@theme`: Fraunces (`font-display`), Space Grotesk (`font-body`), JetBrains Mono (`font-mono`)
- No user authentication, no moderation, no payment handling, no lists of scams
- No SSR, no Next.js, no Remix, no TanStack Start
- Two Supabase tables only: `lugares` and `confirmaciones` — schema is fixed, do not alter
- Trust stamp: solid circle + ✓ + count when ≥1 confirmation; dashed circle + ? when zero
- Support ES/EN language toggle (default ES)
- Atomic commits; no Co-Authored-By lines
- Do not run `bun dev` / `bun run build` to verify — user has a dev server running separately

---

## File Map

```
apoyo-venezuela/
├── src/
│   ├── types/
│   │   └── index.ts              Task 2 — Lugar, Confirmacion, LugarWithCount, Filters, Lang, Action
│   ├── lib/
│   │   └── supabase.ts           Task 3 — Supabase client singleton
│   ├── data/
│   │   └── seed.ts               Task 4 — static fallback data (15 verified places)
│   ├── hooks/
│   │   ├── usePlaces.ts          Task 4 — fetch/filter/mutate hook + exported filterPlaces fn
│   │   └── useTranslation.ts     Task 5 — returns t object for active lang
│   ├── i18n/
│   │   ├── es.ts                 Task 5 — Spanish strings
│   │   ├── en.ts                 Task 5 — English strings
│   │   └── index.ts              Task 5 — Translations type + translations map
│   ├── components/
│   │   ├── Hero.tsx              Task 6
│   │   ├── WarningBanner.tsx     Task 6
│   │   ├── Filters.tsx           Task 7 — exports FilterBar
│   │   ├── PlaceCard.tsx         Task 8 — includes TrustStamp sub-component
│   │   ├── PlacesGrid.tsx        Task 9
│   │   ├── AddPlaceModal.tsx     Task 10
│   │   └── ConfirmModal.tsx      Task 11
│   ├── App.tsx                   Task 12
│   ├── main.tsx                  Task 12
│   └── index.css                 Task 1 — Tailwind import + @theme tokens
├── supabase/
│   ├── schema.sql                Task 13
│   └── seed.sql                  Task 13
├── public/
├── index.html                    Task 1
├── package.json                  Task 1
├── vite.config.ts                Task 1
├── tsconfig.json                 Task 1
├── tsconfig.app.json             Task 1
├── tsconfig.node.json            Task 1
├── .env.example                  Task 1
└── .gitignore                    Task 1
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/index.css`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**
- Produces: runnable Vite + React 19 + TS + Tailwind v4 project skeleton

- [ ] **Step 1: Write `package.json`**

> Before writing, verify the latest version of `@supabase/supabase-js` at npmjs.com and replace `^2.49.0` with the actual latest.

```json
{
  "name": "apoyo-venezuela",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.0",
    "@tanstack/react-query": "^5.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.6.0",
    "vite": "^8.0.0"
  }
}
```

- [ ] **Step 2: Write `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 4: Write `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Write `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Write `index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Encuentra centros de acopio y voluntariado para apoyar a Venezuela desde la diáspora." />
    <title>Apoyo Venezuela</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `src/index.css`**

Tailwind v4: `@import "tailwindcss"` replaces the PostCSS directives. Custom tokens in `@theme` automatically become utility classes (`--color-petroleum` → `bg-petroleum`, `text-petroleum`, etc.; `--font-display` → `font-display`).

```css
@import "tailwindcss";

@theme {
  --color-petroleum: #1e4d5c;
  --color-petroleum-dark: #163949;
  --color-petroleum-light: #2a6678;
  --color-gold: #f2c75c;
  --color-cream: #fffbf2;
  --color-ink: #2a2622;
  --color-terracotta: #c75c3c;

  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-cream);
  color: var(--color-ink);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 8: Write `.env.example`**

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 9: Write `.gitignore`**

```
logs
*.log
node_modules
dist
dist-ssr
*.local
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
.env
.env.local
.env.*.local
```

- [ ] **Step 10: Install dependencies**

Run: `bun install`

Expected: `node_modules/` created, `bun.lockb` written, no errors.

- [ ] **Step 11: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html src/index.css .env.example .gitignore
git commit -m "chore: scaffold Vite 8 + React 19 + TypeScript + Tailwind v4 project"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Interfaces:**
- Produces: `Lugar`, `Confirmacion`, `LugarWithCount`, `Filters`, `Lang`, `Action` — used by every subsequent task

- [ ] **Step 1: Write `src/types/index.ts`**

```typescript
export type PlaceType = 'acopio' | 'voluntariado';

export type Action = 'dejé donativo' | 'fui voluntario' | 'lo visité y sigue activo';

export type Lang = 'es' | 'en';

export interface Lugar {
  id: string;
  nombre: string;
  tipo: PlaceType;
  ciudad: string;
  pais: string;
  direccion: string | null;
  creado_en: string;
}

export interface Confirmacion {
  id: string;
  lugar_id: string;
  accion: Action;
  cuando: string;
  creado_en: string;
}

export interface LugarWithCount extends Lugar {
  confirmaciones: Confirmacion[];
}

export interface Filters {
  pais: string;
  tipo: PlaceType | '';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript domain types"
```

---

## Task 3: Supabase Client

**Files:**
- Create: `src/lib/supabase.ts`

**Interfaces:**
- Produces: `supabase` singleton — imported by `usePlaces.ts`

- [ ] **Step 1: Write `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add Supabase client"
```

---

## Task 4: Seed Data + usePlaces Hook

**Files:**
- Create: `src/data/seed.ts`
- Create: `src/hooks/usePlaces.ts`

**Interfaces:**
- Consumes: `Lugar`, `Confirmacion`, `LugarWithCount`, `Filters`, `Action` from `src/types/index.ts`; `supabase` from `src/lib/supabase.ts`
- Produces:
  - `filterPlaces(places: LugarWithCount[], filters: Filters): LugarWithCount[]` — exported pure function
  - `usePlaces(filters: Filters): { places, loading, error, addPlace, addConfirmation }`
  - `SEED_LUGARES: LugarWithCount[]`

- [ ] **Step 1: Write `src/data/seed.ts`**

```typescript
import type { LugarWithCount } from '../types';

export const SEED_LUGARES: LugarWithCount[] = [
  {
    id: 'seed-01',
    nombre: 'Sambil Madrid',
    tipo: 'acopio',
    ciudad: 'Madrid',
    pais: 'España',
    direccion: 'Planta 0, Sambil Madrid · Recogida sáb 27 y dom 28 jun, 10:00–18:30',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-02',
    nombre: 'Refugiados sin Fronteras',
    tipo: 'acopio',
    ciudad: 'Madrid',
    pais: 'España',
    direccion: 'Calle Matilde Landa 26, Madrid',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-03',
    nombre: 'Pardillo Center — Asoc. Venezolanos en España',
    tipo: 'acopio',
    ciudad: 'Madrid',
    pais: 'España',
    direccion: 'Avda. de Madrid, 4, Local 1, Villanueva del Pardillo',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-04',
    nombre: 'Centro de acopio permanente Tenerife',
    tipo: 'acopio',
    ciudad: 'Santa Cruz de Tenerife',
    pais: 'España',
    direccion: 'Calle de Francisco García Talavera, 2',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-05',
    nombre: 'Cáritas Diocesana — apoyo en acopio',
    tipo: 'voluntariado',
    ciudad: 'Barcelona',
    pais: 'España',
    direccion: 'Contactar parroquia local antes de acudir',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-06',
    nombre: 'Cáritas Diocesana — apoyo en acopio',
    tipo: 'voluntariado',
    ciudad: 'Valladolid',
    pais: 'España',
    direccion: 'Contactar Cáritas Diocesana de Valladolid',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-07',
    nombre: 'Papelón Sabroso',
    tipo: 'acopio',
    ciudad: 'Santiago',
    pais: 'Chile',
    direccion: 'Av. Providencia 1669',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-08',
    nombre: 'Yum Express',
    tipo: 'acopio',
    ciudad: 'Santiago',
    pais: 'Chile',
    direccion: 'Eleuterio Ramírez 735',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-09',
    nombre: 'Amenábar 1024 — Colegiales',
    tipo: 'acopio',
    ciudad: 'Buenos Aires',
    pais: 'Argentina',
    direccion: 'Amenábar 1024, Colegiales · 13:00–19:00',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-10',
    nombre: 'Libertad 996 — Retiro',
    tipo: 'acopio',
    ciudad: 'Buenos Aires',
    pais: 'Argentina',
    direccion: 'Libertad 996, Retiro · 10:00–21:00',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-11',
    nombre: 'Cambú Pintón',
    tipo: 'acopio',
    ciudad: 'Comodoro Rivadavia',
    pais: 'Argentina',
    direccion: 'Canadá 2080',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-12',
    nombre: 'Venezolanos en Uruguay',
    tipo: 'acopio',
    ciudad: 'Montevideo',
    pais: 'Uruguay',
    direccion: 'Carlos Quijano 1287',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-13',
    nombre: 'Manos Veneguayas — apoyo con Cruz Roja',
    tipo: 'voluntariado',
    ciudad: 'Montevideo',
    pais: 'Uruguay',
    direccion: 'Contacto vía Instagram · 099 531 161',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-14',
    nombre: 'Pasticho Express',
    tipo: 'acopio',
    ciudad: 'CDMX',
    pais: 'México',
    direccion: 'Parques Polanco, Lago Alberto 320, Granada, Miguel Hidalgo',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
  {
    id: 'seed-15',
    nombre: 'Venemex — coordinación de donativos',
    tipo: 'voluntariado',
    ciudad: 'CDMX',
    pais: 'México',
    direccion: 'Canaliza a organizaciones humanitarias verificadas',
    creado_en: '2026-06-24T00:00:00Z',
    confirmaciones: [],
  },
];
```

- [ ] **Step 2: Write `src/hooks/usePlaces.ts`**

Uses TanStack Query: `useQuery` fetches all places; `useMutation` handles inserts and writes back into the query cache directly (no refetch needed).

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { SEED_LUGARES } from '../data/seed';
import type { Lugar, Confirmacion, LugarWithCount, Filters, Action } from '../types';

export function filterPlaces(places: LugarWithCount[], filters: Filters): LugarWithCount[] {
  return places.filter((p) => {
    if (filters.pais && p.pais !== filters.pais) return false;
    if (filters.tipo && p.tipo !== filters.tipo) return false;
    return true;
  });
}

async function fetchAllPlaces(): Promise<LugarWithCount[]> {
  const { data: lugares, error: lugaresError } = await supabase
    .from('lugares')
    .select('*')
    .order('creado_en', { ascending: false });
  if (lugaresError) throw lugaresError;

  const { data: confirmaciones, error: confirmError } = await supabase
    .from('confirmaciones')
    .select('*');
  if (confirmError) throw confirmError;

  return (lugares ?? []).map((lugar) => ({
    ...lugar,
    confirmaciones: (confirmaciones ?? []).filter(
      (c: Confirmacion) => c.lugar_id === lugar.id,
    ),
  }));
}

interface UsePlacesResult {
  places: LugarWithCount[];
  loading: boolean;
  error: string | null;
  addPlace: (place: Omit<Lugar, 'id' | 'creado_en'>) => Promise<void>;
  addConfirmation: (lugarId: string, accion: Action, cuando: string) => Promise<void>;
}

export function usePlaces(filters: Filters): UsePlacesResult {
  const queryClient = useQueryClient();

  const { data = SEED_LUGARES, isLoading, isError } = useQuery({
    queryKey: ['places'],
    queryFn: fetchAllPlaces,
    retry: 1,
  });

  const addPlaceMutation = useMutation({
    mutationFn: async (place: Omit<Lugar, 'id' | 'creado_en'>) => {
      const { data: row, error } = await supabase
        .from('lugares')
        .insert(place)
        .select()
        .single();
      if (error) throw error;
      return row as Lugar;
    },
    onSuccess: (newLugar) => {
      queryClient.setQueryData<LugarWithCount[]>(['places'], (prev = []) => [
        { ...newLugar, confirmaciones: [] },
        ...prev,
      ]);
    },
  });

  const addConfirmationMutation = useMutation({
    mutationFn: async ({
      lugarId,
      accion,
      cuando,
    }: {
      lugarId: string;
      accion: Action;
      cuando: string;
    }) => {
      const { data: row, error } = await supabase
        .from('confirmaciones')
        .insert({ lugar_id: lugarId, accion, cuando })
        .select()
        .single();
      if (error) throw error;
      return row as Confirmacion;
    },
    onSuccess: (newConfirmacion) => {
      queryClient.setQueryData<LugarWithCount[]>(['places'], (prev = []) =>
        prev.map((p) =>
          p.id === newConfirmacion.lugar_id
            ? { ...p, confirmaciones: [...p.confirmaciones, newConfirmacion] }
            : p,
        ),
      );
    },
  });

  return {
    places: filterPlaces(data, filters),
    loading: isLoading,
    error: isError
      ? 'No se pudo cargar la información. Mostrando datos de referencia.'
      : null,
    addPlace: (place) => addPlaceMutation.mutateAsync(place),
    addConfirmation: (lugarId, accion, cuando) =>
      addConfirmationMutation.mutateAsync({ lugarId, accion, cuando }),
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/seed.ts src/hooks/usePlaces.ts
git commit -m "feat: add seed data and usePlaces hook with filterPlaces"
```

---

## Task 5: i18n System

**Files:**
- Create: `src/i18n/es.ts`
- Create: `src/i18n/en.ts`
- Create: `src/i18n/index.ts`
- Create: `src/hooks/useTranslation.ts`

**Interfaces:**
- Consumes: `Lang` from `src/types/index.ts`
- Produces:
  - `Translations` type (alias of `typeof es`)
  - `useTranslation(lang: Lang): { t: Translations }`

- [ ] **Step 1: Write `src/i18n/es.ts`**

```typescript
export const es = {
  hero: {
    eyebrow: 'Diáspora venezolana',
    title: 'Apoyo Venezuela',
    subtitle: 'Encuentra centros de acopio y voluntariado cerca de ti',
    cta: 'Ver lugares',
    add: 'Agregar un lugar',
  },
  warning: {
    text: 'Verifica la información antes de acudir. Si vas a donar dinero, hazlo directamente en la web oficial de la ONG.',
  },
  filters: {
    all: 'Todos',
    country: 'País',
    type: 'Tipo',
    acopio: 'Centro de acopio',
    voluntariado: 'Voluntariado',
    countries: {
      España: 'España',
      Chile: 'Chile',
      Argentina: 'Argentina',
      Uruguay: 'Uruguay',
      México: 'México',
    } as Record<string, string>,
  },
  card: {
    confirmed: (n: number) =>
      `${n} ${n === 1 ? 'persona reportó' : 'personas reportaron'} haber estado aquí`,
    unconfirmed: 'Sin confirmaciones todavía',
    confirm: 'Confirmar visita',
  },
  addPlace: {
    title: 'Agregar un lugar',
    name: 'Nombre del lugar',
    type: 'Tipo',
    city: 'Ciudad',
    country: 'País',
    address: 'Dirección (opcional)',
    submit: 'Publicar',
    cancel: 'Cancelar',
    placeholder: {
      name: 'Ej. Asociación Venezuela Madrid',
      city: 'Ej. Madrid',
      address: 'Ej. Calle Mayor 1',
    },
  },
  confirmModal: {
    title: '¿Qué hiciste en este lugar?',
    action: 'Acción',
    when: '¿Cuándo?',
    whenPlaceholder: 'Ej. hoy, esta semana',
    submit: 'Confirmar',
    cancel: 'Cancelar',
    actions: {
      'dejé donativo': 'Dejé un donativo',
      'fui voluntario': 'Fui voluntario',
      'lo visité y sigue activo': 'Lo visité y sigue activo',
    } as Record<string, string>,
  },
  loading: 'Cargando lugares...',
  empty: 'No hay lugares registrados para estos filtros.',
  langToggle: 'EN',
} as const;
```

- [ ] **Step 2: Write `src/i18n/en.ts`**

```typescript
export const en = {
  hero: {
    eyebrow: 'Venezuelan diaspora',
    title: 'Apoyo Venezuela',
    subtitle: 'Find drop-off centers and volunteer opportunities near you',
    cta: 'See locations',
    add: 'Add a location',
  },
  warning: {
    text: 'Verify information before going. If donating money, do so directly on the official NGO website.',
  },
  filters: {
    all: 'All',
    country: 'Country',
    type: 'Type',
    acopio: 'Drop-off center',
    voluntariado: 'Volunteering',
    countries: {
      España: 'Spain',
      Chile: 'Chile',
      Argentina: 'Argentina',
      Uruguay: 'Uruguay',
      México: 'Mexico',
    } as Record<string, string>,
  },
  card: {
    confirmed: (n: number) =>
      `${n} ${n === 1 ? 'person reported' : 'people reported'} being here`,
    unconfirmed: 'No confirmations yet',
    confirm: 'Confirm visit',
  },
  addPlace: {
    title: 'Add a location',
    name: 'Location name',
    type: 'Type',
    city: 'City',
    country: 'Country',
    address: 'Address (optional)',
    submit: 'Publish',
    cancel: 'Cancel',
    placeholder: {
      name: 'E.g. Venezuela Association Madrid',
      city: 'E.g. Madrid',
      address: 'E.g. 1 Main Street',
    },
  },
  confirmModal: {
    title: 'What did you do at this location?',
    action: 'Action',
    when: 'When?',
    whenPlaceholder: 'E.g. today, this week',
    submit: 'Confirm',
    cancel: 'Cancel',
    actions: {
      'dejé donativo': 'I dropped off a donation',
      'fui voluntario': 'I volunteered',
      'lo visité y sigue activo': "I visited and it's still active",
    } as Record<string, string>,
  },
  loading: 'Loading locations...',
  empty: 'No locations registered for these filters.',
  langToggle: 'ES',
} as const;
```

- [ ] **Step 3: Write `src/i18n/index.ts`**

```typescript
import { es } from './es';
import { en } from './en';
import type { Lang } from '../types';

export type Translations = typeof es;

export const translations: Record<Lang, Translations> = { es, en };
```

- [ ] **Step 4: Write `src/hooks/useTranslation.ts`**

```typescript
import { translations } from '../i18n';
import type { Lang } from '../types';
import type { Translations } from '../i18n';

export function useTranslation(lang: Lang): { t: Translations } {
  return { t: translations[lang] };
}
```

- [ ] **Step 5: Commit**

```bash
git add src/i18n/es.ts src/i18n/en.ts src/i18n/index.ts src/hooks/useTranslation.ts
git commit -m "feat: add i18n system with ES/EN translations"
```

---

## Task 6: Hero + WarningBanner Components

**Files:**
- Create: `src/components/Hero.tsx`
- Create: `src/components/WarningBanner.tsx`

**Interfaces:**
- Consumes: `Translations` from `src/i18n/index.ts`
- Produces: `<Hero t onAddClick>`, `<WarningBanner t>`

- [ ] **Step 1: Write `src/components/Hero.tsx`**

```tsx
import type { Translations } from '../i18n';

interface Props {
  t: Translations;
  onAddClick: () => void;
}

export function Hero({ t, onAddClick }: Props) {
  return (
    <section className="bg-petroleum text-cream py-20 text-center">
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-[0.7rem] tracking-[0.14em] uppercase text-gold mb-4">
          {t.hero.eyebrow}
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-black leading-tight mb-4">
          {t.hero.title}
        </h1>
        <p className="text-lg opacity-85 max-w-xl mx-auto mb-9 leading-relaxed">
          {t.hero.subtitle}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#catalog"
            className="bg-gold text-petroleum font-bold px-7 py-3 rounded-lg text-base transition-all hover:brightness-90 hover:-translate-y-px"
          >
            {t.hero.cta}
          </a>
          <button
            className="border border-cream/50 text-cream font-semibold px-6 py-3 rounded-lg transition-all hover:border-cream hover:bg-cream/10"
            onClick={onAddClick}
          >
            {t.hero.add}
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `src/components/WarningBanner.tsx`**

```tsx
import type { Translations } from '../i18n';

interface Props {
  t: Translations;
}

export function WarningBanner({ t }: Props) {
  return (
    <div className="bg-amber-50 border-l-4 border-terracotta py-3.5" role="alert">
      <div className="max-w-6xl mx-auto px-6 flex items-start gap-3">
        <span className="text-terracotta text-lg shrink-0 leading-6" aria-hidden="true">
          ⚠
        </span>
        <p className="text-sm text-ink">{t.warning.text}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.tsx src/components/WarningBanner.tsx
git commit -m "feat: add Hero and WarningBanner components"
```

---

## Task 7: FilterBar Component

**Files:**
- Create: `src/components/Filters.tsx`

**Interfaces:**
- Consumes: `Filters`, `PlaceType` from `src/types/index.ts`; `Translations` from `src/i18n/index.ts`
- Produces: `FilterBar` (named export) — `<FilterBar filters onChange t>`

- [ ] **Step 1: Write `src/components/Filters.tsx`**

```tsx
import type { Filters, PlaceType } from '../types';
import type { Translations } from '../i18n';

const COUNTRIES = ['España', 'Chile', 'Argentina', 'Uruguay', 'México'] as const;
const TYPES: PlaceType[] = ['acopio', 'voluntariado'];

const activeClass = 'bg-petroleum text-cream border-petroleum';
const inactiveClass = 'border-petroleum/20 text-petroleum hover:border-petroleum';
const btnBase = 'text-sm px-3.5 py-1.5 rounded-full border font-medium transition-all cursor-pointer';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  t: Translations;
}

export function FilterBar({ filters, onChange, t }: Props) {
  return (
    <div className="flex gap-2.5 flex-wrap mb-8 items-center" role="group">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum/65">
        {t.filters.country}:
      </span>
      <button
        className={`${btnBase} ${filters.pais === '' ? activeClass : inactiveClass}`}
        onClick={() => onChange({ ...filters, pais: '' })}
      >
        {t.filters.all}
      </button>
      {COUNTRIES.map((country) => (
        <button
          key={country}
          className={`${btnBase} ${filters.pais === country ? activeClass : inactiveClass}`}
          onClick={() => onChange({ ...filters, pais: country })}
        >
          {t.filters.countries[country]}
        </button>
      ))}
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum/65 ml-2">
        {t.filters.type}:
      </span>
      <button
        className={`${btnBase} ${filters.tipo === '' ? activeClass : inactiveClass}`}
        onClick={() => onChange({ ...filters, tipo: '' })}
      >
        {t.filters.all}
      </button>
      {TYPES.map((tipo) => (
        <button
          key={tipo}
          className={`${btnBase} ${filters.tipo === tipo ? activeClass : inactiveClass}`}
          onClick={() => onChange({ ...filters, tipo })}
        >
          {t.filters[tipo]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Filters.tsx
git commit -m "feat: add FilterBar component"
```

---

## Task 8: PlaceCard Component

**Files:**
- Create: `src/components/PlaceCard.tsx`

**Interfaces:**
- Consumes: `LugarWithCount` from `src/types/index.ts`; `Translations` from `src/i18n/index.ts`
- Produces: `<PlaceCard lugar t onConfirm>` — includes internal `TrustStamp`

- [ ] **Step 1: Write `src/components/PlaceCard.tsx`**

```tsx
import type { LugarWithCount } from '../types';
import type { Translations } from '../i18n';

function TrustStamp({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div
        className="w-11 h-11 rounded-full border-2 border-dashed border-petroleum/30 text-petroleum/45 flex flex-col items-center justify-center shrink-0"
        aria-label="No confirmations"
      >
        <span className="text-base font-bold leading-none">?</span>
      </div>
    );
  }
  return (
    <div
      className="w-11 h-11 rounded-full bg-petroleum text-cream flex flex-col items-center justify-center shrink-0 gap-0.5"
      aria-label={`${count} confirmations`}
    >
      <span className="text-base font-bold leading-none">✓</span>
      <span className="font-mono text-[0.58rem] leading-none">{count}</span>
    </div>
  );
}

interface Props {
  lugar: LugarWithCount;
  t: Translations;
  onConfirm: (lugar: LugarWithCount) => void;
}

export function PlaceCard({ lugar, t, onConfirm }: Props) {
  const count = lugar.confirmaciones.length;
  return (
    <article className="bg-white rounded-xl p-5 shadow-sm flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span
          className={`font-mono text-[0.62rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full font-medium ${
            lugar.tipo === 'acopio'
              ? 'bg-petroleum/10 text-petroleum'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {t.filters[lugar.tipo]}
        </span>
        <TrustStamp count={count} />
      </div>
      <h3 className="font-display text-lg font-bold text-ink leading-tight">{lugar.nombre}</h3>
      <p className="font-mono text-[0.72rem] text-petroleum/65 tracking-wide">
        {lugar.ciudad}, {lugar.pais}
      </p>
      {lugar.direccion && (
        <p className="text-sm text-ink/75 leading-snug">{lugar.direccion}</p>
      )}
      <p className="text-sm text-petroleum/80 italic mt-0.5">
        {count > 0 ? t.card.confirmed(count) : t.card.unconfirmed}
      </p>
      <button
        className="mt-auto bg-petroleum text-cream rounded-lg text-sm font-semibold px-4 py-2 self-start transition-colors hover:bg-petroleum-dark cursor-pointer"
        onClick={() => onConfirm(lugar)}
      >
        {t.card.confirm}
      </button>
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PlaceCard.tsx
git commit -m "feat: add PlaceCard component with TrustStamp"
```

---

## Task 9: PlacesGrid Component

**Files:**
- Create: `src/components/PlacesGrid.tsx`

**Interfaces:**
- Consumes: `LugarWithCount[]`; `<PlaceCard>` from Task 8; `Translations`
- Produces: `<PlacesGrid places loading t onConfirm>`

- [ ] **Step 1: Write `src/components/PlacesGrid.tsx`**

```tsx
import { PlaceCard } from './PlaceCard';
import type { LugarWithCount } from '../types';
import type { Translations } from '../i18n';

interface Props {
  places: LugarWithCount[];
  loading: boolean;
  t: Translations;
  onConfirm: (lugar: LugarWithCount) => void;
}

const gridClass = 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5';
const emptyClass = 'col-span-full text-center py-14 font-mono text-sm text-petroleum/55';

export function PlacesGrid({ places, loading, t, onConfirm }: Props) {
  if (loading) {
    return (
      <div className={gridClass}>
        <p className={emptyClass}>{t.loading}</p>
      </div>
    );
  }
  if (places.length === 0) {
    return (
      <div className={gridClass}>
        <p className={emptyClass}>{t.empty}</p>
      </div>
    );
  }
  return (
    <div className={gridClass}>
      {places.map((lugar) => (
        <PlaceCard key={lugar.id} lugar={lugar} t={t} onConfirm={onConfirm} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PlacesGrid.tsx
git commit -m "feat: add PlacesGrid component"
```

---

## Task 10: AddPlaceModal Component

**Files:**
- Create: `src/components/AddPlaceModal.tsx`

**Interfaces:**
- Consumes: `Lugar`, `PlaceType` from types; `Translations` from i18n
- Produces: `<AddPlaceModal t onClose onSubmit>` where `onSubmit: (place: Omit<Lugar, 'id' | 'creado_en'>) => Promise<void>`

- [ ] **Step 1: Write `src/components/AddPlaceModal.tsx`**

```tsx
import { useState } from 'react';
import type { Lugar, PlaceType } from '../types';
import type { Translations } from '../i18n';

const COUNTRIES = ['España', 'Chile', 'Argentina', 'Uruguay', 'México'] as const;

const inputClass =
  'w-full text-base px-3.5 py-2.5 border border-petroleum/20 rounded-lg bg-white text-ink focus:outline-none focus:border-petroleum transition-colors';
const labelClass =
  'font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum';

interface Props {
  t: Translations;
  onClose: () => void;
  onSubmit: (place: Omit<Lugar, 'id' | 'creado_en'>) => Promise<void>;
}

export function AddPlaceModal({ t, onClose, onSubmit }: Props) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<PlaceType>('acopio');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('España');
  const [direccion, setDireccion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !ciudad.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        tipo,
        ciudad: ciudad.trim(),
        pais,
        direccion: direccion.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-cream rounded-xl p-8 w-full max-w-lg shadow-xl flex flex-col gap-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-place-title"
      >
        <h2 className="font-display text-2xl font-bold text-petroleum" id="add-place-title">
          {t.addPlace.title}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-nombre">{t.addPlace.name}</label>
            <input
              id="add-nombre"
              className={inputClass}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t.addPlace.placeholder.name}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-tipo">{t.addPlace.type}</label>
            <select
              id="add-tipo"
              className={inputClass}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as PlaceType)}
            >
              <option value="acopio">{t.filters.acopio}</option>
              <option value="voluntariado">{t.filters.voluntariado}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-ciudad">{t.addPlace.city}</label>
            <input
              id="add-ciudad"
              className={inputClass}
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder={t.addPlace.placeholder.city}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-pais">{t.addPlace.country}</label>
            <select
              id="add-pais"
              className={inputClass}
              value={pais}
              onChange={(e) => setPais(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{t.filters.countries[c]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-direccion">{t.addPlace.address}</label>
            <input
              id="add-direccion"
              className={inputClass}
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder={t.addPlace.placeholder.address}
            />
          </div>
          <div className="flex gap-3 justify-end mt-1">
            <button
              type="button"
              className="text-petroleum font-medium px-4 py-2.5 rounded-lg opacity-65 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onClose}
            >
              {t.addPlace.cancel}
            </button>
            <button
              type="submit"
              className="bg-petroleum text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-petroleum-dark disabled:opacity-50 transition-colors cursor-pointer"
              disabled={submitting}
            >
              {submitting ? '...' : t.addPlace.submit}
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
git add src/components/AddPlaceModal.tsx
git commit -m "feat: add AddPlaceModal component"
```

---

## Task 11: ConfirmModal Component

**Files:**
- Create: `src/components/ConfirmModal.tsx`

**Interfaces:**
- Consumes: `LugarWithCount`, `Action` from types; `Translations` from i18n
- Produces: `<ConfirmModal lugar t onClose onSubmit>` where `onSubmit: (accion: Action, cuando: string) => Promise<void>`

- [ ] **Step 1: Write `src/components/ConfirmModal.tsx`**

```tsx
import { useState } from 'react';
import type { LugarWithCount, Action } from '../types';
import type { Translations } from '../i18n';

const ACTIONS: Action[] = ['dejé donativo', 'fui voluntario', 'lo visité y sigue activo'];

const inputClass =
  'w-full text-base px-3.5 py-2.5 border border-petroleum/20 rounded-lg bg-white text-ink focus:outline-none focus:border-petroleum transition-colors';
const labelClass =
  'font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum';

interface Props {
  lugar: LugarWithCount;
  t: Translations;
  onClose: () => void;
  onSubmit: (accion: Action, cuando: string) => Promise<void>;
}

export function ConfirmModal({ lugar, t, onClose, onSubmit }: Props) {
  const [accion, setAccion] = useState<Action>('dejé donativo');
  const [cuando, setCuando] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuando.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(accion, cuando.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-cream rounded-xl p-8 w-full max-w-lg shadow-xl flex flex-col gap-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-petroleum" id="confirm-modal-title">
            {t.confirmModal.title}
          </h2>
          <p className="text-sm text-ink/65 mt-1">
            {lugar.nombre} · {lugar.ciudad}
          </p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="confirm-accion">{t.confirmModal.action}</label>
            <select
              id="confirm-accion"
              className={inputClass}
              value={accion}
              onChange={(e) => setAccion(e.target.value as Action)}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{t.confirmModal.actions[a]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="confirm-cuando">{t.confirmModal.when}</label>
            <input
              id="confirm-cuando"
              className={inputClass}
              value={cuando}
              onChange={(e) => setCuando(e.target.value)}
              placeholder={t.confirmModal.whenPlaceholder}
              required
            />
          </div>
          <div className="flex gap-3 justify-end mt-1">
            <button
              type="button"
              className="text-petroleum font-medium px-4 py-2.5 rounded-lg opacity-65 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onClose}
            >
              {t.confirmModal.cancel}
            </button>
            <button
              type="submit"
              className="bg-petroleum text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-petroleum-dark disabled:opacity-50 transition-colors cursor-pointer"
              disabled={submitting}
            >
              {submitting ? '...' : t.confirmModal.submit}
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
git add src/components/ConfirmModal.tsx
git commit -m "feat: add ConfirmModal component"
```

---

## Task 12: App.tsx + main.tsx Integration

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`

**Interfaces:**
- Consumes: all components, hooks, and types from Tasks 2–11
- Produces: the runnable application with all features wired together

- [ ] **Step 1: Write `src/App.tsx`**

```tsx
import { useState } from 'react';
import type { Filters, LugarWithCount, Lang } from './types';
import { Hero } from './components/Hero';
import { WarningBanner } from './components/WarningBanner';
import { FilterBar } from './components/Filters';
import { PlacesGrid } from './components/PlacesGrid';
import { AddPlaceModal } from './components/AddPlaceModal';
import { ConfirmModal } from './components/ConfirmModal';
import { usePlaces } from './hooks/usePlaces';
import { useTranslation } from './hooks/useTranslation';

export function App() {
  const [lang, setLang] = useState<Lang>('es');
  const [filters, setFilters] = useState<Filters>({ pais: '', tipo: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<LugarWithCount | null>(null);

  const { t } = useTranslation(lang);
  const { places, loading, error, addPlace, addConfirmation } = usePlaces(filters);

  return (
    <>
      <header className="bg-petroleum text-cream py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-display text-xl font-bold tracking-tight">Apoyo Venezuela</span>
          <button
            className="font-mono text-[0.7rem] text-gold border border-gold px-3 py-1 rounded-full tracking-[0.1em] hover:bg-gold hover:text-petroleum transition-colors cursor-pointer"
            onClick={() => setLang((l) => (l === 'es' ? 'en' : 'es'))}
          >
            {t.langToggle}
          </button>
        </div>
      </header>

      <main>
        <Hero t={t} onAddClick={() => setShowAddModal(true)} />
        <WarningBanner t={t} />
        <section className="py-10 pb-16" id="catalog">
          <div className="max-w-6xl mx-auto px-6">
            <FilterBar filters={filters} onChange={setFilters} t={t} />
            {error && (
              <p className="bg-terracotta/10 border border-terracotta text-terracotta px-4 py-3 rounded-lg text-sm mb-5">
                {error}
              </p>
            )}
            <PlacesGrid
              places={places}
              loading={loading}
              t={t}
              onConfirm={setConfirmTarget}
            />
          </div>
        </section>
      </main>

      {showAddModal && (
        <AddPlaceModal
          t={t}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (place) => {
            await addPlace(place);
            setShowAddModal(false);
          }}
        />
      )}

      {confirmTarget !== null && (
        <ConfirmModal
          lugar={confirmTarget}
          t={t}
          onClose={() => setConfirmTarget(null)}
          onSubmit={async (accion, cuando) => {
            await addConfirmation(confirmTarget.id, accion, cuando);
            setConfirmTarget(null);
          }}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Write `src/main.tsx`**

`QueryClientProvider` wraps the app so every component can access the shared cache. `staleTime: 2min` avoids re-fetching on every focus since this data changes infrequently.

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { App } from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: wire up App with all components and hooks"
```

---

## Task 13: Supabase SQL Files

**Files:**
- Create: `supabase/schema.sql`
- Create: `supabase/seed.sql`

These are scripts to run manually in the Supabase SQL Editor — not executed by the app.

**Manual steps after this task (user action required):**
1. Create a project at supabase.com
2. Open the SQL Editor → run `supabase/schema.sql`
3. Run `supabase/seed.sql` to insert the 15 verified places
4. Copy the Project URL and anon key from Project Settings → API
5. Create `.env.local` (gitignored) with those values:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
6. Connect the GitHub repo to Vercel; add the same env vars in Vercel project settings

- [ ] **Step 1: Write `supabase/schema.sql`**

```sql
create extension if not exists "uuid-ossp";

create table lugares (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  tipo text not null check (tipo in ('acopio', 'voluntariado')),
  ciudad text not null,
  pais text not null,
  direccion text,
  creado_en timestamptz not null default now()
);

create table confirmaciones (
  id uuid primary key default uuid_generate_v4(),
  lugar_id uuid not null references lugares(id) on delete cascade,
  accion text not null check (accion in ('dejé donativo', 'fui voluntario', 'lo visité y sigue activo')),
  cuando text not null default 'recientemente',
  creado_en timestamptz not null default now()
);

create index idx_confirmaciones_lugar_id on confirmaciones(lugar_id);
create index idx_lugares_pais on lugares(pais);
create index idx_lugares_tipo on lugares(tipo);

alter table lugares enable row level security;
alter table confirmaciones enable row level security;

create policy "Cualquiera puede leer lugares"
  on lugares for select using (true);

create policy "Cualquiera puede agregar un lugar"
  on lugares for insert with check (true);

create policy "Cualquiera puede leer confirmaciones"
  on confirmaciones for select using (true);

create policy "Cualquiera puede agregar una confirmación"
  on confirmaciones for insert with check (true);
```

- [ ] **Step 2: Write `supabase/seed.sql`**

```sql
insert into lugares (nombre, tipo, ciudad, pais, direccion) values
  ('Sambil Madrid', 'acopio', 'Madrid', 'España',
   'Planta 0, Sambil Madrid · Recogida sáb 27 y dom 28 jun, 10:00–18:30'),
  ('Refugiados sin Fronteras', 'acopio', 'Madrid', 'España',
   'Calle Matilde Landa 26, Madrid'),
  ('Pardillo Center — Asoc. Venezolanos en España', 'acopio', 'Madrid', 'España',
   'Avda. de Madrid, 4, Local 1, Villanueva del Pardillo'),
  ('Centro de acopio permanente Tenerife', 'acopio', 'Santa Cruz de Tenerife', 'España',
   'Calle de Francisco García Talavera, 2'),
  ('Cáritas Diocesana — apoyo en acopio', 'voluntariado', 'Barcelona', 'España',
   'Contactar parroquia local antes de acudir'),
  ('Cáritas Diocesana — apoyo en acopio', 'voluntariado', 'Valladolid', 'España',
   'Contactar Cáritas Diocesana de Valladolid'),
  ('Papelón Sabroso', 'acopio', 'Santiago', 'Chile',
   'Av. Providencia 1669'),
  ('Yum Express', 'acopio', 'Santiago', 'Chile',
   'Eleuterio Ramírez 735'),
  ('Amenábar 1024 — Colegiales', 'acopio', 'Buenos Aires', 'Argentina',
   'Amenábar 1024, Colegiales · 13:00–19:00'),
  ('Libertad 996 — Retiro', 'acopio', 'Buenos Aires', 'Argentina',
   'Libertad 996, Retiro · 10:00–21:00'),
  ('Cambú Pintón', 'acopio', 'Comodoro Rivadavia', 'Argentina',
   'Canadá 2080'),
  ('Venezolanos en Uruguay', 'acopio', 'Montevideo', 'Uruguay',
   'Carlos Quijano 1287'),
  ('Manos Veneguayas — apoyo con Cruz Roja', 'voluntariado', 'Montevideo', 'Uruguay',
   'Contacto vía Instagram · 099 531 161'),
  ('Pasticho Express', 'acopio', 'CDMX', 'México',
   'Parques Polanco, Lago Alberto 320, Granada, Miguel Hidalgo'),
  ('Venemex — coordinación de donativos', 'voluntariado', 'CDMX', 'México',
   'Canaliza a organizaciones humanitarias verificadas');
```

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql supabase/seed.sql
git commit -m "feat: add Supabase schema and seed SQL"
```

---

## Self-Review

**Spec coverage:**

| Requirement | Task |
|---|---|
| Vite 8 + React 19.2 + TypeScript SPA | 1 |
| Tailwind v4 with custom design tokens | 1 |
| Bun as package manager | 1 |
| Supabase Postgres schema (exact SQL from spec) | 13 |
| Types: `Lugar`, `Confirmacion`, `LugarWithCount` | 2 |
| Supabase client singleton with env vars | 3 |
| Design tokens: petroleum/gold/cream/ink/terracotta | 1 (`@theme`) |
| Fonts: Fraunces + Space Grotesk + JetBrains Mono | 1 (index.html + `@theme`) |
| Static seed fallback (15 verified places) | 4 |
| `filterPlaces` — country + type filter logic | 4 |
| Trust stamp: solid ✓ + count vs dashed ? | 8 |
| Confirmations display as real-action reports, not upvotes | 5 (copy) + 8 (UI) |
| No auth, no moderation, immediate publish | 4 (hook) + 10 (modal) |
| Warning banner (non–list-of-scams) | 6 |
| ES/EN toggle (default ES) | 5 + 12 |
| AddPlace modal | 10 |
| ConfirmModal with action + when fields | 11 |
| RLS policies — no UPDATE/DELETE from client | 13 |
| `.env.example` | 1 |
| Responsive (Tailwind responsive prefixes in components) | 6 (md: breakpoint in Hero) |

**Placeholder scan:** None — all steps contain actual code.

**Type consistency:** `LugarWithCount` defined in Task 2, used identically in Tasks 4, 8, 9, 10, 11, 12. `Action` defined in Task 2, used identically in Tasks 4, 11, 12. `Translations` produced in Task 5 (`typeof es`), consumed in Tasks 6–12. `FilterBar` exported from `Filters.tsx` in Task 7, imported as `FilterBar` in Task 12 — no aliasing needed.
