import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';
import { enforceRateLimit } from '../_shared/rateLimit.ts';
import { getClientIp, getUserAgent, handleOptions, jsonResponse } from '../_shared/http.ts';
import { buildRateLimitKeys, normalizeAddPlacePayload } from '../_shared/validation.ts';
import { ADD_PLACE_RATE_LIMIT } from '../_shared/rateLimitRules.ts';

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Function is not configured');

    const payload = normalizeAddPlacePayload(await request.json());
    const client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [rateLimitKey] = await buildRateLimitKeys({
      operation: 'add-place',
      ip: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    await enforceRateLimit(client, [
      { key: rateLimitKey, ...ADD_PLACE_RATE_LIMIT },
    ]);

    const { data, error } = await client
      .from('places')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return jsonResponse(data, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Rate limit exceeded' ? 429 : 400;
    return jsonResponse({ error: message }, status);
  }
});
