import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {
  normalizeAddPlacePayload,
  normalizeAddConfirmationPayload,
  normalizeReportPlacePayload,
  buildRateLimitKeys,
} from './validation.ts';

Deno.test('normalizeAddPlacePayload trims fields and keeps nullable optional values', () => {
  const payload = normalizeAddPlacePayload({
    name: '  Centro Comunitario  ',
    type: 'collection',
    city: '  Madrid ',
    country: 'España',
    address: '  Calle 1 ',
    url: ' https://example.com/info ',
  });

  assertEquals(payload, {
    name: 'Centro Comunitario',
    type: 'collection',
    city: 'Madrid',
    country: 'España',
    address: 'Calle 1',
    url: 'https://example.com/info',
  });
});

Deno.test('normalizeAddPlacePayload rejects invalid place type and unsafe url schemes', () => {
  assertThrows(
    () => normalizeAddPlacePayload({ name: 'X', type: 'spam', city: 'Madrid', country: 'España' }),
    Error,
    'Invalid place type',
  );

  assertThrows(
    () => normalizeAddPlacePayload({
      name: 'Centro',
      type: 'collection',
      city: 'Madrid',
      country: 'España',
      url: 'javascript:alert(1)',
    }),
    Error,
    'URL must start with http:// or https://',
  );
});

Deno.test('normalizeAddConfirmationPayload accepts only known actions and time buckets', () => {
  assertEquals(normalizeAddConfirmationPayload({
    placeId: '1f5e3147-7e10-4903-9725-e37ea4f39505',
    action: 'volunteered',
    when: 'today',
  }), {
    placeId: '1f5e3147-7e10-4903-9725-e37ea4f39505',
    action: 'volunteered',
    when: 'today',
  });

  assertThrows(
    () => normalizeAddConfirmationPayload({ placeId: 'x', action: 'upvoted', when: 'today' }),
    Error,
    'Invalid confirmation action',
  );
});



Deno.test('normalizeReportPlacePayload accepts only known report reasons', () => {
  assertEquals(normalizeReportPlacePayload({
    placeId: 'place-123',
    reason: 'incorrect_data',
  }), {
    placeId: 'place-123',
    reason: 'incorrect_data',
  });

  assertThrows(
    () => normalizeReportPlacePayload({ placeId: 'place-123', reason: 'spam' }),
    Error,
    'Invalid report reason',
  );
});

Deno.test('buildRateLimitKeys produces operation and per-place confirmation buckets', async () => {
  const addKeys = await buildRateLimitKeys({
    operation: 'add-place',
    ip: '203.0.113.10',
    userAgent: 'test-agent',
  });

  const confirmKeys = await buildRateLimitKeys({
    operation: 'add-confirmation',
    ip: '203.0.113.10',
    userAgent: 'test-agent',
    placeId: 'place-123',
  });

  assertEquals(addKeys.length, 1);
  assertEquals(addKeys[0].startsWith('add-place:'), true);
  assertEquals(confirmKeys.length, 2);
  assertEquals(confirmKeys[0].startsWith('add-confirmation:'), true);
  assertEquals(confirmKeys[1].startsWith('add-confirmation:place-123:'), true);

  const reportKeys = await buildRateLimitKeys({
    operation: 'report-place',
    ip: '203.0.113.10',
    userAgent: 'test-agent',
    placeId: 'place-123',
  });

  assertEquals(reportKeys.length, 2);
  assertEquals(reportKeys[0].startsWith('report-place:'), true);
  assertEquals(reportKeys[1].startsWith('report-place:place-123:'), true);
});
