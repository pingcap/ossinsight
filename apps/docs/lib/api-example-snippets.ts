import type { ApiDoc } from '@/lib/content';

type ApiParameterLike = ApiDoc['parameters'][number];

function hasName(parameter: ApiParameterLike): parameter is ApiParameterLike & { name: string } {
  return typeof parameter.name === 'string' && parameter.name.length > 0;
}

function sampleValueForParameter(parameter: ApiParameterLike) {
  if (parameter.example != null) {
    return parameter.example;
  }

  if (parameter.schema?.example != null) {
    return parameter.schema.example;
  }

  if (parameter.schema?.default != null) {
    return parameter.schema.default;
  }

  if (Array.isArray(parameter.schema?.enum) && parameter.schema.enum.length > 0) {
    return parameter.schema.enum[0];
  }

  switch (parameter.name) {
    case 'owner':
      return 'pingcap';
    case 'repo':
      return 'tidb';
    case 'collection_id':
      return 2;
    case 'language':
      return 'TypeScript';
    case 'period':
      return 'past_week';
    case 'page':
      return 1;
    case 'page_size':
      return 30;
    case 'exclude_bots':
      return true;
    default:
      break;
  }

  switch (parameter.schema?.type) {
    case 'boolean':
      return true;
    case 'integer':
    case 'number':
      return 1;
    default:
      return 'example';
  }
}

function buildRequestUrl(doc: ApiDoc) {
  const baseUrl = doc.serverUrl.replace(/\/$/, '');
  let resolvedPath = doc.path;

  for (const parameter of doc.parameters) {
    if (parameter.in !== 'path' || !hasName(parameter)) {
      continue;
    }

    const value = sampleValueForParameter(parameter);
    resolvedPath = resolvedPath.replace(`{${parameter.name}}`, encodeURIComponent(String(value)));
  }

  const url = new URL(`${baseUrl}/${resolvedPath.replace(/^\//, '')}`);

  for (const parameter of doc.parameters) {
    if (parameter.in !== 'query' || !hasName(parameter)) {
      continue;
    }

    const value = sampleValueForParameter(parameter);
    if (value != null) {
      url.searchParams.set(parameter.name, String(value));
    }
  }

  return url.toString();
}

export function buildApiExampleSnippets(doc: ApiDoc) {
  const requestUrl = buildRequestUrl(doc);
  const method = doc.method.toUpperCase();

  const curl = [
    `curl --request ${method} \\`,
    `  --url '${requestUrl}' \\`,
    `  --header 'Accept: application/json'`,
  ].join('\n');

  const python = [
    'import requests',
    '',
    `response = requests.${method.toLowerCase()}(`,
    `    "${requestUrl}",`,
    '    headers={"Accept": "application/json"},',
    '    timeout=30,',
    ')',
    'response.raise_for_status()',
    '',
    'data = response.json()',
    'print(data)',
  ].join('\n');

  const typescript = [
    `const response = await fetch("${requestUrl}", {`,
    `  method: "${method}",`,
    '  headers: {',
    '    Accept: "application/json",',
    '  },',
    '});',
    '',
    'if (!response.ok) {',
    '  throw new Error(`Request failed: ${response.status}`);',
    '}',
    '',
    'const data = await response.json();',
    'console.log(data);',
  ].join('\n');

  return {
    curl,
    python,
    requestUrl,
    typescript,
  };
}
