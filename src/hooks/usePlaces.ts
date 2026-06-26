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
