import { WidgetBaseContext } from '@ossinsight/widgets-types';
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

  // Expand simple URL templates like ".../collection-{activity}-history-rank".
  const urlExpanded = expandUrlTemplate(config.url, ctx.parameters).replaceAll(`%2F`, `/`);
  let url: string | URL = '';
  if (ctx.runtime === 'server') {
    url = new URL(urlExpanded, getBaseUrl());
    setUrlParams(url.searchParams, config.params ?? {}, ctx.parameters);
  } else {
    const urlSearchParams = new URLSearchParams();
    setUrlParams(urlSearchParams, config.params ?? {}, ctx.parameters);
    const extraQuery = urlSearchParams.toString();
    if (extraQuery) {
      url = `${urlExpanded}${urlExpanded.includes('?') ? '&' : '?'}${extraQuery}`;
    } else {
      url = urlExpanded;
    }
  }

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new HttpRequestError(response, await response.json());
  }

  const data = await response.json();

  return extractByPath(data, config.parser.extract);
}

function getBaseUrl() {
  const env =
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV;
  switch (env) {
    case 'production':
      // TODO: change to https://ossinsight.io when we have promoted to production
      return `https://next.ossinsight.io`;
    case 'preview':
      const previewHost =
        process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || process.env.VERCEL_BRANCH_URL;
      return `https://${previewHost}`;
    case 'development':
    default:
      const devHost =
        process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || process.env.VERCEL_BRANCH_URL;
      return devHost
        ? `https://${devHost}`
        : `http://localhost:${process.env.PORT || 3000}`;
  }
}

function expandUrlTemplate(template: string, params: Record<string, string | string[]>) {
  return template.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = params[key];
    if (Array.isArray(value)) {
      return encodeURIComponent(value[0] ?? '');
    }
    return encodeURIComponent(value ?? '');
  });
}

function extractByPath(data: any, path: string) {
  // Current widgets mainly use `$.data[*]`. Keep a tiny compatible subset.
  if (path === '$.data[*]') {
    return Array.isArray(data?.data) ? data.data : [];
  }

  if (path.startsWith('$.')) {
    const normalized = path.slice(2).replace(/\[\*\]$/g, '');
    const keys = normalized.split('.').filter(Boolean);
    let cursor = data;

    for (const key of keys) {
      if (cursor == null) {
        return [];
      }
      cursor = cursor[key];
    }

    if (path.endsWith('[*]')) {
      return Array.isArray(cursor) ? cursor : [];
    }
    return cursor == null ? [] : [cursor];
  }

  return [];
}
