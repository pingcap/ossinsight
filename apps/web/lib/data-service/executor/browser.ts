import { EndpointConfig } from '../config';
import { INTERNAL_QUERY_API_SERVER } from '@/utils/api';
import { getBrowserQueryClient } from '@/lib/query-client';
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

  const url = `${INTERNAL_QUERY_API_SERVER}/${name}?${usp.toString()}`;
  const performRequest = async (requestSignal?: AbortSignal) => {
    const response = await fetch(url, {
      signal: requestSignal ?? signal,
    });

    if (response.redirected) {
      throw new Error('Redirected?')
    }

    if (response.ok) {
      return await response.json();
    } else {
      throw new APIError('failed to execute endpoint', response.status)
    }
  };

  if (signal) {
    return performRequest(signal);
  }

  return getBrowserQueryClient().fetchQuery({
    queryKey: ['browser-executor', name, context],
    queryFn: ({ signal }) => performRequest(signal),
  });
}
