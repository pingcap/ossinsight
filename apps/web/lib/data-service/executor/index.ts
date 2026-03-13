import { EndpointConfig } from '../config';

export async function executeEndpoint (name: string, config: EndpointConfig, sql: string, params: Record<string, any>, geo?: any, signal?: AbortSignal) {
  if (typeof window === 'undefined') {
    let server = await import('./server');
    return await server.default(name, config, sql, params, geo, signal);
  } else {
    let browser = await import('./browser');
    return await browser.default(name, config, sql, params, signal);
  }
}

export { APIError } from './utils'
