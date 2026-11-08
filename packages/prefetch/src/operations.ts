import {createOperatorAuthenticator, operationsCredentials} from '@ossinsight/api-server';
import {createServer} from 'http';
import {Registry} from 'prom-client';
import {AppConfig} from './env';

export function prefetchOperations(register: Registry, config: Pick<AppConfig,
  'OPERATIONS_TOKEN' | 'OPERATIONS_TOKEN_PREVIOUS' | 'OPERATIONS_TOKEN_PREVIOUS_EXPIRES_AT'>) {
  const authenticate = createOperatorAuthenticator(operationsCredentials(config));
  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.url !== '/metrics') { res.writeHead(404); res.end(); return; }
    try { authenticate(req.headers.authorization); }
    catch (error: any) {
      res.writeHead(error.statusCode === 401 ? 401 : 503);
      res.end('Metrics access unavailable.');
      return;
    }
    try {
      const metrics = await register.metrics();
      res.writeHead(200, {'Content-Type': register.contentType});
      res.end(metrics);
    } catch {
      res.writeHead(503);
      res.end('Metrics access unavailable.');
    }
  });
}
