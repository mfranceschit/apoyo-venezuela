import { describe, expect, it } from 'vitest';
import { normalizeAddPlacePayload } from '../../supabase/functions/_shared/validation';

const validPlace = {
  name: 'Centro',
  type: 'collection',
  city: 'Madrid',
  country: 'España',
  address: null,
  url: null,
};

describe('normalizeAddPlacePayload', () => {
  it('preserves selected opening hours for add-place inserts', () => {
    const hours = {
      mon: ['09:00', '18:00'],
      sat: ['10:00', '14:00'],
    };

    const payload = normalizeAddPlacePayload({
      ...validPlace,
      hours,
    });

    expect(payload.hours).toEqual(hours);
  });

  it('normalizes missing or empty opening hours to null', () => {
    expect(normalizeAddPlacePayload(validPlace).hours).toBeNull();
    expect(normalizeAddPlacePayload({ ...validPlace, hours: {} }).hours).toBeNull();
  });

  it('rejects invalid opening hours shape', () => {
    expect(() => normalizeAddPlacePayload({
      ...validPlace,
      hours: { monday: ['09:00', '18:00'] },
    })).toThrow('Invalid hours day');

    expect(() => normalizeAddPlacePayload({
      ...validPlace,
      hours: { mon: ['9:00', '18:00'] },
    })).toThrow('Invalid hours time');
  });
});
