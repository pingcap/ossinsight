import {budgetFailure, publicClientIdentity} from '../request-policy';

export async function checkExplorerQuota(headers: Headers): Promise<Response | undefined> {
  try {
    const identity = publicClientIdentity(headers);
    const {explorerRateLimit} = await import('../rate-limit');
    const result = await explorerRateLimit.limit(identity);
    const failure = budgetFailure(result);
    if (!failure) return;
    return Response.json({error: failure.status === 429 ? 'Too many requests. Please try again later.' : failure.message}, {
      status: failure.status,
      headers: {
        'Retry-After': String(failure.retryAfter),
        ...(failure.status === 429 ? {'X-RateLimit-Remaining': String(result.remaining)} : {}),
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return Response.json({error: 'Request quota temporarily unavailable.'}, {
      status: 503, headers: {'Retry-After': '5', 'Cache-Control': 'no-store'},
    });
  }
}
