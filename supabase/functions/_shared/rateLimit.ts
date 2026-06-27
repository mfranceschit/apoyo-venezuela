interface RpcClient {
  rpc: <T>(name: string, args: Record<string, unknown>) => Promise<{ data: T | null; error: { message?: string } | null }>;
}

export async function enforceRateLimit(
  client: RpcClient,
  rules: Array<{ key: string; limit: number; windowSeconds: number }>,
): Promise<void> {
  for (const rule of rules) {
    const { data, error } = await client.rpc<boolean>('check_anon_rate_limit', {
      p_key: rule.key,
      p_limit: rule.limit,
      p_window_seconds: rule.windowSeconds,
    });
    if (error) throw new Error(error.message ?? 'Rate limit check failed');
    if (data !== true) throw new Error('Rate limit exceeded');
  }
}
