import { WidgetBaseContext } from '@/lib/charts-types';
import { getBrowserQueryClient } from '@/lib/query-client';
import { getSiteOrigin, rewriteInternalApiUrl } from '@/utils/api';
import jp from 'jsonpath/jsonpath.js';
import { parseTemplate } from 'url-template';
import { ParserConfig } from '../types';
import { HttpRequestError } from '../utils/errors';
import { allExists, setUrlParams } from './utils';

export interface ApiDatasourceConfig {
  type: 'api';
  url: string;
  parser: ParserConfig;
  params?: Record<string, string>;
  when?: string[];
}

export default async function executeApiDatasource (config: ApiDatasourceConfig, ctx: WidgetBaseContext, signal?: AbortSignal) {
  if (!allExists(config.when, ctx.parameters)) {
    return null;
  }

  const template = parseTemplate(config.url);
  // Decode encoded slashes in URI-template output so API routes resolve correctly.
  const urlExpanded = rewriteInternalApiUrl(
    template.expand(ctx.parameters).replaceAll(`%2F`, `/`),
  );
  let url: string | URL = '';
  if (ctx.runtime === 'server') {
    url = new URL(urlExpanded, getBaseUrl());
    setUrlParams(url.searchParams, config.params ?? {}, ctx.parameters);
  } else {
    const urlSearchParams = new URLSearchParams();
    setUrlParams(urlSearchParams, config.params ?? {}, ctx.parameters);
    url = `${urlExpanded}?${urlSearchParams.toString()}`;
  }

  const performRequest = async (requestSignal?: AbortSignal) => {
    const response = await fetch(url, { signal: requestSignal ?? signal });

    if (!response.ok) {
      throw new HttpRequestError(response, await response.json());
    }

    const data = await response.json();

    return jp.query(data, config.parser.extract);
  };

  if (signal) {
    return performRequest(signal);
  }

  return getBrowserQueryClient().fetchQuery({
    queryKey: ['charts-api-datasource', url.toString(), config.params ?? {}, config.parser.extract],
    queryFn: ({ signal }) => performRequest(signal),
  });
}

function getBaseUrl() {
  return getSiteOrigin();
}
