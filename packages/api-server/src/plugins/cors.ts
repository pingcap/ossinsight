import {FastifyRequest} from 'fastify';
import * as path from 'path';
import {readFileSync} from 'fs';
import cors from '@fastify/cors';
import fp from 'fastify-plugin';
import {parse as parseYAML} from 'yaml';
import {GENERATE_SQL_LIMIT_HEADER, GENERATE_SQL_USED_HEADER} from '../routes/bot/questionToSQL/quota';

export type OriginType = string;
export const DEFAULT_ALLOWED_ORIGIN = 'https://ossinsight.io';

declare module 'fastify' {
  interface FastifyInstance { allowedOrigins: string[] }
}

export function isAllowedSocketOrigin(origin: unknown, allowed: readonly string[]): boolean {
  return typeof origin === 'string' && allowed.includes(origin);
}

export default fp(async app => {
  const configsPath = app.config.CONFIGS_PATH || path.join(__dirname, '..', '..', '..', '..', 'configs');
  const privateOrigins = getAllowedOrigins(configsPath);
  const allowedOrigins = getAllowedOrigins(configsPath, true);
  await app.register(cors, () => (req: FastifyRequest, callback: any) => {
    const origin = req.headers.origin;
    const credentialed = typeof origin === 'string' && privateOrigins.includes(origin);
    const method = req.method === 'OPTIONS' ? req.headers['access-control-request-method'] : req.method;
    const publicRead = (method === 'GET' || method === 'HEAD') && /^\/(?:v1|q|queries|gh|collections)(?:\/|$)/.test(new URL(req.url, 'http://internal').pathname);
    callback(null, {
      origin: credentialed || (publicRead && typeof origin === 'string' && allowedOrigins.includes(origin)) ? origin : false,
      credentials: credentialed,
      exposedHeaders: [GENERATE_SQL_USED_HEADER, GENERATE_SQL_LIMIT_HEADER],
    });
  });
  app.decorate('allowedOrigins', allowedOrigins);
}, {name: '@ossinsight/cors', dependencies: ['@fastify/env']});

export function getAllowedOrigins(configsPath: string, containPublic = false): string[] {
  const config = parseYAML(readFileSync(path.resolve(configsPath, 'allowed-origins.yaml'), 'utf8'));
  const development = process.env.NODE_ENV === 'development';
  const origins = [
    ...(config.private_origins || []),
    ...(process.env.CORS_PRIVATE_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean),
    ...(containPublic ? config.public_origins || [] : []),
    ...(development ? config.development_origins || [] : []),
  ];
  return [...new Set(origins.map((origin: unknown) => {
    if (typeof origin !== 'string') throw new Error('CORS origins must be exact URL origins');
    let url: URL;
    try { url = new URL(origin); } catch { throw new Error('CORS origins must be exact URL origins'); }
    const local = development && url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((!local && url.protocol !== 'https:') || url.origin !== origin || url.username || url.password) {
      throw new Error('CORS origins must be exact HTTPS origins (loopback HTTP is development-only)');
    }
    return origin;
  }))];
}
