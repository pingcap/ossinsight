import loadEndpoint from '@/lib/data-service/endpoints';
import { executeEndpoint } from '@/lib/data-service';
import { WidgetBaseContext } from '@ossinsight/widgets-types';
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

  const params = Object.fromEntries(Object.entries(config.params ?? {}).map(([name, value]) => [name, ctx.parameters[value]]));

  const { config: endpointConfig, sql } = await loadEndpoint(name);

  // MARK: it's difficult to get `geo` info with serverside executing endpoint datasource.
  const { data } = await executeEndpoint(name, endpointConfig, sql, params, undefined, signal);
  return data;
}
