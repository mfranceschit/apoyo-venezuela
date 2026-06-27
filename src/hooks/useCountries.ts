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
