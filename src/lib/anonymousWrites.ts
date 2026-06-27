import type { FunctionInvokeOptions } from '@supabase/supabase-js';
import type { Action, ClaimReason, Confirmation, Place, PlaceClaim } from '../types';

type NewPlace = Omit<Place, 'id' | 'created_at' | 'timezone'>;

interface FunctionError {
  message?: string;
}

interface FunctionsClient {
  functions: {
    invoke: <T>(name: string, options?: FunctionInvokeOptions) => Promise<{
      data: T | null;
      error: FunctionError | null;
    }>;
  };
}

function getFunctionErrorMessage(error: FunctionError): string {
  return error.message ?? 'No se pudo enviar la información. Inténtalo de nuevo.';
}

export async function addPlaceViaFunction(
  client: FunctionsClient,
  place: NewPlace,
): Promise<Place> {
  const { data, error } = await client.functions.invoke<Place>('add-place', { body: place });
  if (error) throw new Error(getFunctionErrorMessage(error));
  if (!data) throw new Error('No se recibió el lugar creado.');
  return data;
}

export async function addConfirmationViaFunction(
  client: FunctionsClient,
  placeId: string,
  action: Action,
  when: string,
): Promise<Confirmation> {
  const { data, error } = await client.functions.invoke<Confirmation>('add-confirmation', {
    body: { placeId, action, when },
  });
  if (error) throw new Error(getFunctionErrorMessage(error));
  if (!data) throw new Error('No se recibió la confirmación creada.');
  return data;
}


export async function reportPlaceViaFunction(
  client: FunctionsClient,
  placeId: string,
  reason: ClaimReason,
): Promise<PlaceClaim> {
  const { data, error } = await client.functions.invoke<PlaceClaim>('report-place', {
    body: { placeId, reason },
  });
  if (error) throw new Error(getFunctionErrorMessage(error));
  if (!data) throw new Error('No se recibió el reporte creado.');
  return data;
}
