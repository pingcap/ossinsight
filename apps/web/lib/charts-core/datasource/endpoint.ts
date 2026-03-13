import { WidgetBaseContext } from '@/lib/charts-types';
import { getBrowserQueryClient } from '@/lib/query-client';
import { INTERNAL_QUERY_API_SERVER } from '@/utils/api';
import { Liquid } from 'liquidjs';
import { allExists } from './utils';

export interface EndpointDatasourceConfig {
  type: 'endpoint';
  name: string;
  params?: Record<string, string>;
  when?: string[];
}

const liquid = new Liquid();

export default async function executeEndpointDatasource (config: EndpointDatasourceConfig, ctx: WidgetBaseContext, signal?: AbortSignal) {
  if (!allExists(config.when, ctx.parameters)) {
    return null;
  }

  const name = await liquid.parseAndRender(config.name, ctx.parameters);
  const params = Object.fromEntries(
    Object.entries(config.params ?? {}).map(([paramName, value]) => [paramName, ctx.parameters[value]])
  );
  const usp = new URLSearchParams();

  Object.entries(params).forEach(([paramName, value]) => {
    if (value == null) return;

    if (value instanceof Array) {
      value.forEach(item => usp.append(paramName, String(item)));
    } else {
      usp.set(paramName, String(value));
    }
  });

  const url = `${INTERNAL_QUERY_API_SERVER}/${name}?${usp.toString()}`;
  const performRequest = async (requestSignal?: AbortSignal) => {
    const response = await fetch(url, { signal: requestSignal ?? signal });

    if (!response.ok) {
      throw new Error(`Failed to load endpoint datasource: ${response.status} ${response.statusText}`);
    }

    const { data } = await response.json();
    return data;
  };

  if (signal) {
    return performRequest(signal);
  }

  return getBrowserQueryClient().fetchQuery({
    queryKey: ['charts-endpoint-datasource', name, params],
    queryFn: ({ signal }) => performRequest(signal),
  });
}
