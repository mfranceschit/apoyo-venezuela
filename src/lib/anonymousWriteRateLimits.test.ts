import { describe, expect, it } from 'vitest';
import {
  ADD_CONFIRMATION_GLOBAL_RATE_LIMIT,
  ADD_CONFIRMATION_PER_PLACE_RATE_LIMIT,
  ADD_PLACE_RATE_LIMIT,
  REPORT_PLACE_GLOBAL_RATE_LIMIT,
  REPORT_PLACE_PER_PLACE_RATE_LIMIT,
} from '../../supabase/functions/_shared/rateLimitRules';

describe('anonymous write rate limits', () => {
  it('defines add-place submissions per fingerprint', () => {
    expect(ADD_PLACE_RATE_LIMIT).toEqual({ limit: 10, windowSeconds: 60 * 60 });
  });

  it('defines add-confirmation global and per-place buckets', () => {
    expect(ADD_CONFIRMATION_GLOBAL_RATE_LIMIT).toEqual({ limit: 10, windowSeconds: 60 * 60 });
    expect(ADD_CONFIRMATION_PER_PLACE_RATE_LIMIT).toEqual({ limit: 1, windowSeconds: 24 * 60 * 60 });
  });

  it('defines report-place global and per-place buckets', () => {
    expect(REPORT_PLACE_GLOBAL_RATE_LIMIT).toEqual({ limit: 5, windowSeconds: 60 * 60 });
    expect(REPORT_PLACE_PER_PLACE_RATE_LIMIT).toEqual({ limit: 1, windowSeconds: 24 * 60 * 60 });
  });
});
