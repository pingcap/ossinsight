import {FastifyRequest} from 'fastify';

// Fastify resolves the socket peer and explicitly configured trusted proxies.
// Never let client-controlled forwarding headers select the quota/audit identity.
export function getRealClientIP(req: FastifyRequest): string {
  return req.ip;
}
