import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const FALLBACK_COUNTRIES = ['España', 'Chile', 'Argentina', 'Uruguay', 'México', 'Venezuela', 'Colombia', 'Perú', 'Estados Unidos'];

async function fetchCountries(): Promise<string[]> {
  const { data, error } = await supabase
    .from('countries')
    .select('code')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: { code: string }) => r.code);
}

export function useCountries(): string[] {
  const { data } = useQuery({
    queryKey: ['countries'],
    queryFn: fetchCountries,
    retry: 1,
  });
  return data ?? FALLBACK_COUNTRIES;
}
