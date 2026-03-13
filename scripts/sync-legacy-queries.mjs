import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const LEGACY_ROOT = process.env.OSSINSIGHT_LEGACY_ROOT ?? path.join(os.homedir(), 'Projects/ossinsight');
const SOURCE_QUERIES_ROOT = path.join(LEGACY_ROOT, 'configs/queries');
const SOURCE_SEARCH_ROOT = path.join(LEGACY_ROOT, 'configs/search/recommend');
const TARGET_ENDPOINTS_ROOT = path.join(process.cwd(), 'apps/web/lib/data-service/endpoints');
const TARGET_RECOMMEND_ROOT = path.join(process.cwd(), 'apps/web/lib/github-search/recommend');

const EXCLUDED_SEGMENTS = new Set(['archive']);

function main() {
  assertPathExists(SOURCE_QUERIES_ROOT, 'legacy query configs');
  assertPathExists(SOURCE_SEARCH_ROOT, 'legacy recommend configs');

  rmSync(TARGET_ENDPOINTS_ROOT, { recursive: true, force: true });
  rmSync(TARGET_RECOMMEND_ROOT, { recursive: true, force: true });
  mkdirSync(TARGET_ENDPOINTS_ROOT, { recursive: true });
  mkdirSync(TARGET_RECOMMEND_ROOT, { recursive: true });

  const endpoints = collectEndpointNames(SOURCE_QUERIES_ROOT);
  for (const endpointName of endpoints) {
    syncEndpoint(endpointName);
  }
  writeLoader(endpoints);
  syncRecommendConfigs();

  console.log(`synced ${endpoints.length} legacy endpoints`);
}

function assertPathExists(targetPath, label) {
  if (!existsSync(targetPath)) {
    throw new Error(`Missing ${label}: ${targetPath}`);
  }
}

function collectEndpointNames(root, prefix = '') {
  const names = [];
  for (const entry of readdirSync(root)) {
    if (entry.startsWith('.')) {
      continue;
    }
    const absolute = path.join(root, entry);
    const relative = prefix ? `${prefix}/${entry}` : entry;
    const stats = statSync(absolute);
    if (stats.isDirectory()) {
      if (EXCLUDED_SEGMENTS.has(entry)) {
        continue;
      }
      const templatePath = path.join(absolute, 'template.sql');
      const paramsPath = path.join(absolute, 'params.json');
      if (existsSync(templatePath) && existsSync(paramsPath)) {
        names.push(relative);
        continue;
      }
      names.push(...collectEndpointNames(absolute, relative));
    }
  }
  return names.sort();
}

function syncEndpoint(endpointName) {
  const sourceDir = path.join(SOURCE_QUERIES_ROOT, endpointName);
  const targetDir = path.join(TARGET_ENDPOINTS_ROOT, endpointName);
  mkdirSync(targetDir, { recursive: true });
  cpSync(path.join(sourceDir, 'template.sql'), path.join(targetDir, 'template.sql'));
  cpSync(path.join(sourceDir, 'params.json'), path.join(targetDir, 'params.json'));
  writeFileSync(
    path.join(targetDir, 'index.ts'),
    [
      "import config from './params.json';",
      "import sql from './template.sql';",
      '',
      'export { config, sql };',
      '',
    ].join('\n'),
  );
}

function writeLoader(endpointNames) {
  const loaderLines = [
    "import type { EndpointConfig } from '../config';",
    '',
    'export type EndpointModule = {',
    '  config: EndpointConfig;',
    '  sql: string;',
    '};',
    '',
    'const endpointLoaders = new Map<string, () => Promise<EndpointModule>>();',
    '',
  ];

  for (const endpointName of endpointNames) {
    loaderLines.push(
      `endpointLoaders.set(${JSON.stringify(endpointName)}, () => import(${JSON.stringify(`./${endpointName}`)}));`,
    );
  }

  loaderLines.push(
    '',
    'export default async function loadEndpoint(name: string): Promise<EndpointModule> {',
    '  const load = endpointLoaders.get(name);',
    '  if (!load) {',
    "    throw new Error(`Unknown endpoint: ${name}`);",
    '  }',
    '  return load();',
    '}',
    '',
    'export function hasEndpoint(name: string) {',
    '  return endpointLoaders.has(name);',
    '}',
    '',
    'export function listEndpoints() {',
    '  return Array.from(endpointLoaders.keys());',
    '}',
    '',
  );

  writeFileSync(path.join(TARGET_ENDPOINTS_ROOT, 'index.ts'), loaderLines.join('\n'));
}

function syncRecommendConfigs() {
  const files = [
    ['repos/list-1.json', 'repos-list-1.json'],
    ['repos/list-2.json', 'repos-list-2.json'],
    ['users/list.json', 'users-list.json'],
    ['orgs/list.json', 'orgs-list.json'],
  ];

  for (const [sourceRelative, targetName] of files) {
    const sourcePath = path.join(SOURCE_SEARCH_ROOT, sourceRelative);
    const targetPath = path.join(TARGET_RECOMMEND_ROOT, targetName);
    const formatted = JSON.stringify(JSON.parse(readFileSync(sourcePath, 'utf8')), null, 2) + '\n';
    writeFileSync(targetPath, formatted);
  }
}

main();
