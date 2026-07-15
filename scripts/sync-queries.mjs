import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.env.OSSINSIGHT_ROOT ?? process.cwd();
const SOURCE_QUERIES_ROOT = path.join(PROJECT_ROOT, 'configs/queries');
const TARGET_ENDPOINTS_ROOT = path.join(process.cwd(), 'apps/web/lib/data-service/endpoints');

const EXCLUDED_SEGMENTS = new Set(['archive']);
const CHECK_ONLY = process.argv.includes('--check');

function main() {
  assertPathExists(SOURCE_QUERIES_ROOT, 'query configs');

  const endpoints = collectEndpointNames(SOURCE_QUERIES_ROOT);
  if (CHECK_ONLY) {
    verifyEndpointSync(endpoints);
    console.log(`verified ${endpoints.length} query endpoints`);
    return;
  }

  rmSync(TARGET_ENDPOINTS_ROOT, { recursive: true, force: true });
  mkdirSync(TARGET_ENDPOINTS_ROOT, { recursive: true });

  for (const endpointName of endpoints) {
    syncEndpoint(endpointName);
  }
  writeLoader(endpoints);

  console.log(`synced ${endpoints.length} query endpoints`);
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
  writeFileSync(path.join(targetDir, 'index.ts'), renderEndpointIndex());
}

function writeLoader(endpointNames) {
  writeFileSync(path.join(TARGET_ENDPOINTS_ROOT, 'index.ts'), renderLoader(endpointNames));
}

function renderEndpointIndex() {
  return [
    "import config from './params.json';",
    "import sql from './template.sql';",
    '',
    'export { config, sql };',
    '',
  ].join('\n');
}

function renderLoader(endpointNames) {
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

  return loaderLines.join('\n');
}

function verifyEndpointSync(endpointNames) {
  assertPathExists(TARGET_ENDPOINTS_ROOT, 'generated Next query endpoints');
  const generatedNames = collectEndpointNames(TARGET_ENDPOINTS_ROOT);
  assertEqual('registered endpoint names', JSON.stringify(endpointNames), JSON.stringify(generatedNames));
  assertEqual(
    'endpoint loader',
    renderLoader(endpointNames),
    readFileSync(path.join(TARGET_ENDPOINTS_ROOT, 'index.ts'), 'utf8'),
  );

  for (const endpointName of endpointNames) {
    const sourceDir = path.join(SOURCE_QUERIES_ROOT, endpointName);
    const targetDir = path.join(TARGET_ENDPOINTS_ROOT, endpointName);
    assertEqual(
      `${endpointName}/template.sql`,
      readFileSync(path.join(sourceDir, 'template.sql'), 'utf8'),
      readFileSync(path.join(targetDir, 'template.sql'), 'utf8'),
    );
    assertEqual(
      `${endpointName}/params.json`,
      readFileSync(path.join(sourceDir, 'params.json'), 'utf8'),
      readFileSync(path.join(targetDir, 'params.json'), 'utf8'),
    );
    assertEqual(
      `${endpointName}/index.ts`,
      renderEndpointIndex(),
      readFileSync(path.join(targetDir, 'index.ts'), 'utf8'),
    );
  }
}

function assertEqual(label, expected, actual) {
  if (expected !== actual) {
    throw new Error(`Generated ${label} is out of sync. Run \`pnpm sync:queries\`.`);
  }
}

main();
