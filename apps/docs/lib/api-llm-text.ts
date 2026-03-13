import type { ApiDoc, ApiOverview } from '@/lib/content';
import { apiNavGroups, apiShowcaseLinks } from '@/lib/api-navigation';
import { buildApiExampleSnippets } from '@/lib/api-example-snippets';

function renderTags(tags: string[]) {
  return tags.length > 0 ? tags.join(', ') : 'None';
}

function renderParametersTable(doc: ApiDoc) {
  if (doc.parameters.length === 0) {
    return 'No parameters.';
  }

  const rows = doc.parameters.map((parameter) => {
    const name = parameter.name ?? '-';
    const location = parameter.in ?? '-';
    const type = parameter.schema?.type ?? 'unknown';
    const required = parameter.required ? 'Yes' : 'No';
    const description = parameter.description?.replaceAll('\n', ' ') ?? '-';

    return `| ${name} | ${location} | ${type} | ${required} | ${description} |`;
  });

  return [
    '| Name | In | Type | Required | Description |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}

export function buildApiDocLLMText(doc: ApiDoc) {
  const examples = buildApiExampleSnippets(doc);

  return [
    `# ${doc.title} (/docs/api/${doc.slug})`,
    '',
    doc.description,
    '',
    `- Method: ${doc.method}`,
    `- Base URL: ${doc.serverUrl}`,
    `- Path: ${doc.path}`,
    `- Tags: ${renderTags(doc.tags)}`,
    '',
    '## Parameters',
    '',
    renderParametersTable(doc),
    '',
    '## Example',
    '',
    '### curl',
    '',
    '```bash',
    examples.curl,
    '```',
    '',
    '### python',
    '',
    '```python',
    examples.python,
    '```',
    '',
    '### typescript',
    '',
    '```ts',
    examples.typescript,
    '```',
    ...(doc.responseExample
      ? [
          '',
          '## Example Response',
          '',
          `Status: ${doc.responseStatus}`,
          '',
          '```json',
          doc.responseExample,
          '```',
        ]
      : []),
  ].join('\n');
}

export function buildApiOverviewLLMText(overview: ApiOverview) {
  const endpointGroups = apiNavGroups.flatMap((group) => [
    `## ${group.label}`,
    '',
    ...group.items.map((item) => `- \`${item.method}\` [${item.label}](/docs/api/${item.slug})`),
    '',
  ]);

  const showcase = [
    '## Showcase',
    '',
    ...apiShowcaseLinks.map((item) => `- [${item.label}](${item.href}): ${item.description}`),
  ];

  return [
    `# ${overview.title} (/docs/api)`,
    '',
    overview.description,
    '',
    '- Version: v1beta',
    '- Base URL: https://api.ossinsight.io/v1',
    '- Authentication: No authentication is required for the beta version of the public API.',
    '- Rate limit: 600 requests per hour per IP, and 1000 requests per minute globally.',
    '',
    '## Endpoints',
    '',
    ...endpointGroups,
    ...showcase,
  ].join('\n');
}
