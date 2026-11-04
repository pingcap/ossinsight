#!/usr/bin/env node

/**
 * Load a single collection YAML into the database.
 *
 * Usage:
 *   node scripts/load-collection.mjs <collection-id>
 *   node scripts/load-collection.mjs 10097 --dry-run
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {collectionStore, validateCollection, parseCollectionYaml} from './lib/collection-store.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load env from scripts/.env.local
function loadEnv(filePath) {
  try {
    for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}
loadEnv(join(__dirname, '.env.local'));

const dryRun = process.argv.includes('--dry-run');
const targetId = process.argv.find(a => /^\d+$/.test(a));

if (!targetId) {
  console.error('Usage: node scripts/load-collection.mjs <collection-id> [--dry-run]');
  process.exit(1);
}

const collectionsDir = join(root, 'configs', 'collections');
const files = readdirSync(collectionsDir).filter(f => f.endsWith('.yml'));
const file = files.find(f => f.startsWith(targetId + '.'));

if (!file) {
  console.error(`Collection YAML not found for id ${targetId}`);
  process.exit(1);
}

const yml = parseCollectionYaml(readFileSync(join(collectionsDir, file), 'utf-8'));
validateCollection(yml, targetId);
console.log(`\nCollection: ${yml.name} (id: ${yml.id})`);
console.log(`YAML items: ${yml.items.length}`);
yml.items.forEach(n => console.log(`  ${n}`));

// Load @tidbcloud/serverless — try multiple locations for compatibility with CI and local dev
import { createRequire } from 'module';
let connect;
const searchPaths = [
  join(root, 'ops', 'collection-sync', 'node_modules', '@tidbcloud', 'serverless', 'package.json'),
  join(root, 'node_modules', '@tidbcloud', 'serverless', 'package.json'),
  join(root, 'apps', 'web', 'node_modules', '@tidbcloud', 'serverless', 'package.json'),
];
for (const p of searchPaths) {
  try {
    const req = createRequire(p);
    connect = req('@tidbcloud/serverless').connect;
    break;
  } catch {}
}
if (!connect) {
  console.error('Cannot find @tidbcloud/serverless. Run: npm ci --prefix ops/collection-sync --ignore-scripts');
  process.exit(1);
}
const db = connect({
  url: process.env.DATABASE_URL,
  database: process.env.OSSINSIGHT_DATABASE || 'gharchive_dev',
});

const store = collectionStore(db);

// Current state
const existing = await store.get(yml.id);
const currentItems = await store.items(yml.id);

console.log(`\n--- Before ---`);
console.log(existing.length ? `Collection: ${existing[0].name}` : `Collection ${yml.id} NOT in DB (will create)`);
console.log(`DB items: ${currentItems.length}`);
currentItems.forEach(r => console.log(`  ${r.repo_name} (repo_id: ${r.repo_id})`));

// Diff
const dbNames = new Set(currentItems.map(r => r.repo_name));
const yamlNames = new Set(yml.items);
const toAdd = yml.items.filter(n => !dbNames.has(n));
const toRemove = currentItems.filter(r => !yamlNames.has(r.repo_name));

console.log(`\n--- Diff ---`);
toAdd.forEach(n => console.log(`  + ${n}`));
toRemove.forEach(r => console.log(`  - ${r.repo_name}`));
if (!toAdd.length && !toRemove.length) { console.log('  No changes.'); process.exit(0); }

if (dryRun) { console.log(`\n[DRY RUN] No DB writes.`); process.exit(0); }

// Create collection if needed
if (!existing.length) {
  await store.create(yml.id, yml.name);
  console.log(`\nCreated collection ${yml.id}`);
}

// Remove
for (const r of toRemove) {
  await store.remove(yml.id, r.repo_name);
  console.log(`Removed: ${r.repo_name}`);
}

// Add
for (const name of toAdd) {
  const rows = await store.lookup(name);
  if (!rows.length) { console.log(`Skipped (no repo_id): ${name}`); continue; }
  await store.add(yml.id, name, rows[0].repo_id);
  console.log(`Added: ${name} (repo_id: ${rows[0].repo_id})`);
}

// After
const afterItems = await store.items(yml.id);
console.log(`\n--- After ---`);
console.log(`DB items: ${afterItems.length}`);
afterItems.forEach(r => console.log(`  ${r.repo_name} (repo_id: ${r.repo_id})`));
console.log(`\nDone.`);
