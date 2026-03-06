import { isWidget, widgetParameterDefinitions } from '@/utils/widgets';
import { LinkedData, resolveParameters } from '@/lib/widgets-core/parameters/resolver';
import { notFound } from 'next/navigation';
import { cache } from 'react';

export type WidgetRouteParams = { vendor: string, name: string };
export type WidgetPageSearchParams = Record<string, string | string[] | undefined>;
export type ResolvedWidgetPageSearchParams = Record<string, string | string[]>;
export type WidgetPageProps = {
  params: Promise<WidgetRouteParams>;
  searchParams: Promise<WidgetPageSearchParams>;
};

export const widgetPageParams = cache((params: WidgetRouteParams) => {
  if (params.vendor !== 'official') {
    notFound();
  }

  const name = `@ossinsight/widget-${decodeURIComponent(params.name)}`;
  if (!isWidget(name)) {
    notFound();
  }

  return {
    vendor: decodeURIComponent(params.vendor),
    name,
  };
});

export function resolveWidgetSearchParams (searchParams: WidgetPageSearchParams): ResolvedWidgetPageSearchParams {
  const resolved: ResolvedWidgetPageSearchParams = {};
  for (const [k, v] of Object.entries(searchParams ?? {})) {
    if (v !== undefined) {
      resolved[k] = v;
    }
  }
  return resolved;
}

export function widgetSignature (params: WidgetRouteParams, searchParams: ResolvedWidgetPageSearchParams) {
  return JSON.stringify({ params, searchParams });
}

export const makeLinkedData = cache((name: string, searchParams: ResolvedWidgetPageSearchParams, defaultLinkedData?: LinkedData, signal?: AbortSignal) => {
  return widgetParameterDefinitions(name).then(paramDef => resolveParameters(paramDef, searchParams, defaultLinkedData, signal));
});

export function stringArrayRecord2UrlSearch (values: Record<string, string | string[]>) {
  const newValues = new URLSearchParams();
  for (const [k, v] of Object.entries(values)) {
    if (Array.isArray(v)) {
      v.forEach((i) => newValues.append(k, i));
    } else {
      newValues.set(k, v);
    }
  }
  return newValues;
}

const allowVsWidgets: string[] = [
  'analyze-repo-stars-history',
].map(name => `@ossinsight/widget-${name}`);
const disallowParams = [
  'image_size',
  'color_scheme',
];

export function filterWidgetUrlParameters (name: string, paramName: string) {
  if (paramName === 'vs_repo_id') {
    return allowVsWidgets.includes(name);
  }
  return !disallowParams.includes(paramName);
}

export function getExcludeWidgetParameters (name: string) {
  if (allowVsWidgets.includes(name)) {
    return []
  }
  return ['vs_repo_id']
}
