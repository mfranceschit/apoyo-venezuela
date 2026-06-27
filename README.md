# apoyo-venezuela

Proyecto comunitario, sin fines de lucro. No estamos afiliados a ningún gobierno ni organización.

## Local Development

### Requirements

- Node.js 20 or newer
- npm
- Docker, only if you want to run Supabase locally
- Supabase CLI, available through `npx supabase`

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Fill in:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For a hosted Supabase project, get these values from Supabase Dashboard:

- Project Settings -> API -> Project URL
- Project Settings -> API -> anon public key

Do not put the Supabase service role key in `.env.local` for the frontend. Vite variables are exposed to the browser.

### Run The App

```bash
npm run dev
```

Vite prints the local URL, usually:

```text
http://localhost:5173
```

### Build And Test

```bash
npm run build
npm test
```

Use `npm run preview` to serve the production build locally after `npm run build`.

## Running With Local Supabase

Start Supabase local services:

```bash
npx supabase start
```

The CLI prints local URLs and keys. Use the printed `Project URL` and `anon key` in `.env.local`:

```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
```

Then run:

```bash
npm run dev
```

Supabase Studio is usually available at:

```text
http://127.0.0.1:54323
```

## Running Edge Functions Locally

The app writes new places, confirmations, and reports through Supabase Edge Functions.

Create `supabase/.env.local` for local function runtime secrets:

```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

For local Supabase, copy the service role key printed by `npx supabase start`. For a hosted project, use the service role key from Supabase Dashboard -> Project Settings -> API. Keep this file local and never expose the service role key in Vite env variables.

Start the local function runtime:

```bash
npx supabase functions serve --env-file supabase/.env.local
```

Function endpoints are served under:

```text
http://127.0.0.1:54321/functions/v1
```

Example request:

```bash
curl -i \
  --request POST 'http://127.0.0.1:54321/functions/v1/report-place' \
  --header 'Content-Type: application/json' \
  --data '{"placeId":"PLACE_ID","reason":"incorrect_data"}'
```

If a function returns an error about `check_anon_rate_limit`, the target Supabase database is missing the rate-limit SQL setup.

## Useful Commands

```bash
npm run dev
npm run build
npm test
npx supabase start
npx supabase stop
npx supabase functions serve --env-file supabase/.env.local
```
