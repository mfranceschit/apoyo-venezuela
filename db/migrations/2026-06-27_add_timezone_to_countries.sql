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
