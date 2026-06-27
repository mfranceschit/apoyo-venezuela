import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { SEED_PLACES } from '../data/seed';
import { isOpenNow } from '../lib/hours';
import { addPlaceViaFunction, addConfirmationViaFunction, reportPlaceViaFunction } from '../lib/anonymousWrites';
import type { Place, Confirmation, PlaceWithCount, Filters, Action, CountryInfo, ClaimReason } from '../types';

/** Lowercase and strip accents so "espana" matches "España". */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function filterPlaces(places: PlaceWithCount[], filters: Filters): PlaceWithCount[] {
  const search = normalize(filters.search.trim());
  return places.filter((p) => {
    if (filters.country && p.country !== filters.country) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.confirmedOnly && p.confirmations.length === 0) return false;
    if (filters.openNow && isOpenNow(p) !== true) return false;
    if (search) {
      const haystack = normalize(`${p.name} ${p.city} ${p.country} ${p.address ?? ''}`);
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

async function fetchAllPlaces(): Promise<PlaceWithCount[]> {
  const { data: places, error: placesError } = await supabase
    .from('active_places')
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

interface UsePlacesResult {
  places: PlaceWithCount[];
  loading: boolean;
  error: string | null;
  addPlace: (place: Omit<Place, 'id' | 'created_at' | 'timezone'>) => Promise<void>;
  addConfirmation: (placeId: string, action: Action, when: string) => Promise<void>;
  addClaim: (placeId: string, reason: ClaimReason) => Promise<void>;
}

export function usePlaces(filters: Filters): UsePlacesResult {
  const queryClient = useQueryClient();

  const { data = SEED_PLACES, isLoading, isError } = useQuery({
    queryKey: ['places'],
    queryFn: fetchAllPlaces,
    retry: 1,
  });

  const addPlaceMutation = useMutation({
    mutationFn: async (place: Omit<Place, 'id' | 'created_at' | 'timezone'>) =>
      addPlaceViaFunction(supabase, place),
    onSuccess: (newPlace) => {
      const countries = queryClient.getQueryData<CountryInfo[]>(['countries']) ?? [];
      const timezone = countries.find((c) => c.code === newPlace.country)?.timezone ?? null;
      queryClient.setQueryData<PlaceWithCount[]>(['places'], (prev = []) => [
        { ...newPlace, timezone, confirmations: [] },
        ...prev,
      ]);
    },
  });

  const addConfirmationMutation = useMutation({
    mutationFn: async ({
      placeId,
      action,
      when,
    }: {
      placeId: string;
      action: Action;
      when: string;
    }) => addConfirmationViaFunction(supabase, placeId, action, when),
    onSuccess: (newConfirmation) => {
      queryClient.setQueryData<PlaceWithCount[]>(['places'], (prev = []) =>
        prev.map((p) =>
          p.id === newConfirmation.place_id
            ? { ...p, confirmations: [...p.confirmations, newConfirmation] }
            : p,
        ),
      );
    },
  });

  const addClaimMutation = useMutation({
    mutationFn: async ({ placeId, reason }: { placeId: string; reason: ClaimReason }) =>
      reportPlaceViaFunction(supabase, placeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
    },
  });

  return {
    places: filterPlaces(data, filters),
    loading: isLoading,
    error: isError
      ? 'No se pudo cargar la información. Mostrando datos de referencia.'
      : null,
    addPlace: async (place) => { await addPlaceMutation.mutateAsync(place); },
    addConfirmation: async (placeId, action, when) => {
      await addConfirmationMutation.mutateAsync({ placeId, action, when });
    },
    addClaim: async (placeId, reason) => { await addClaimMutation.mutateAsync({ placeId, reason }); },
  };
}
