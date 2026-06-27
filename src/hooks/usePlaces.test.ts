import { describe, expect, it, vi } from 'vitest';
import { addPlaceViaFunction, addConfirmationViaFunction, reportPlaceViaFunction } from '../lib/anonymousWrites';

const place = {
  name: 'Centro',
  type: 'collection' as const,
  city: 'Madrid',
  country: 'España',
  address: null,
  url: null,
  hours: null,
};

describe('anonymous write functions', () => {
  it('creates places through the add-place Edge Function', async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: {
        id: 'place-1',
        ...place,
        timezone: 'Europe/Madrid',
        created_at: '2026-06-26T00:00:00Z',
      },
      error: null,
    });

    const row = await addPlaceViaFunction({ functions: { invoke } }, place);

    expect(invoke).toHaveBeenCalledWith('add-place', { body: place });
    expect(row.id).toBe('place-1');
  });

  it('creates confirmations through the add-confirmation Edge Function', async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: {
        id: 'confirmation-1',
        place_id: 'place-1',
        action: 'left donation',
        when: 'today',
        created_at: '2026-06-26T00:00:00Z',
      },
      error: null,
    });

    const row = await addConfirmationViaFunction(
      { functions: { invoke } },
      'place-1',
      'left donation',
      'today',
    );

    expect(invoke).toHaveBeenCalledWith('add-confirmation', {
      body: { placeId: 'place-1', action: 'left donation', when: 'today' },
    });
    expect(row.id).toBe('confirmation-1');
  });

  it('reports places through the report-place Edge Function', async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: {
        id: 'claim-1',
        place_id: 'place-1',
        reason: 'incorrect_data',
        created_at: '2026-06-27T00:00:00Z',
      },
      error: null,
    });

    const row = await reportPlaceViaFunction({ functions: { invoke } }, 'place-1', 'incorrect_data');

    expect(invoke).toHaveBeenCalledWith('report-place', {
      body: { placeId: 'place-1', reason: 'incorrect_data' },
    });
    expect(row.id).toBe('claim-1');
  });
});
