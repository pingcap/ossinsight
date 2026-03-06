import { EndpointConfig } from '../config';
import { APIError, prepareQueryContext } from './utils';

export default async function executeEndpoint (name: string, config: EndpointConfig, sql: string, params: Record<string, any>, signal?: AbortSignal) {
  const context = prepareQueryContext(config, params);
  const usp = new URLSearchParams();

  Object.entries(context).forEach(([name, value]) => {
    if (value instanceof Array) {
      value.forEach(value => {
        usp.append(name, String(value));
      });
    } else {
      usp.set(name, String(value));
    }
  });

  const response = await fetch(`/api/queries/${name}?${usp.toString()}`, {
    signal,
  });

  if (response.redirected) {
    throw new Error('Redirected?')
  }

  if (response.ok) {
    return await response.json();
  } else {
    throw new APIError('failed to execute endpoint', response.status)
  }
}