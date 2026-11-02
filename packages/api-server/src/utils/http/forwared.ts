import {FastifyRequest} from 'fastify';
import {IncomingMessage} from 'http';
import proxyAddr from 'proxy-addr';

// Fastify resolves the socket peer and explicitly configured trusted proxies.
// Never let client-controlled forwarding headers select the quota/audit identity.
export function getRealClientIP(req: FastifyRequest): string {
  return req.ip;
}

export function getSocketClientIP(req: IncomingMessage): string {
  const ranges = process.env.TRUSTED_PROXY_CIDRS?.split(',').map(value => value.trim()).filter(Boolean) || [];
  return proxyAddr(req, ranges.length ? proxyAddr.compile(ranges) : () => false);
}
