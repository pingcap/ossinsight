/** Search terms, not SQL patterns. Keep the same 100-character bound as the API. */
export function normalizeSearchKeyword(input: unknown): string | null {
  if (typeof input !== 'string' || input.length > 100) return null;
  const term = input.trim().replace(/ +/g, ' ');
  if (!term) return '';
  return /^[\p{L}\p{N}][\p{L}\p{N}\p{M}_. /-]*$/u.test(term) ? term : null;
}

/** Explicit ESCAPE '!' makes this independent of backslash SQL modes. */
export function literalLikePrefix(term: string): string {
  return term.replace(/[!%_]/g, character => '!' + character);
}

export function invalidSearchResponse(): Response {
  return Response.json({message: 'Invalid search term.'}, {
    status: 400, headers: {'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store'},
  });
}
