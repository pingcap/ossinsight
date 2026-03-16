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

// Simple YAML parser for our collection format
function parseCollectionYaml(text) {
  const lines = text.split('\n');
  const result = { items: [] };
  let inItems = false;
  for (const line of lines) {
    if (line.startsWith('id:')) result.id = parseInt(line.slice(3).trim());
    else if (line.startsWith('name:')) result.name = line.slice(5).trim();
    else if (line.trim() === 'items:') inItems = true;
    else if (inItems && line.trim().startsWith('- ')) result.items.push(line.trim().slice(2).trim());
  }
  return result;
}

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
console.log(`\nCollection: ${yml.name} (id: ${yml.id})`);
console.log(`YAML items: ${yml.items.length}`);
yml.items.forEach(n => console.log(`  ${n}`));

// Load @tidbcloud/serverless from apps/web dependencies
import { createRequire } from 'module';
const require = createRequire(join(root, 'apps', 'web', 'node_modules', '.pnpm', '@tidbcloud+serverless@0.0.6', 'node_modules', '@tidbcloud', 'serverless', 'package.json'));
const { connect } = require('@tidbcloud/serverless');
const db = connect({
  url: process.env.DATABASE_URL,
  database: process.env.OSSINSIGHT_DATABASE || 'gharchive_dev',
});

// Current state
const existing = await db.execute(`SELECT id, name FROM collections WHERE id = ${yml.id}`);
const currentItems = await db.execute(
  `SELECT repo_id, repo_name FROM collection_items WHERE collection_id = ${yml.id} ORDER BY repo_name`
);

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
  await db.execute(`INSERT INTO collections (id, name) VALUES (${yml.id}, '${yml.name.replace(/'/g, "''")}')`);
  console.log(`\nCreated collection ${yml.id}`);
}

// Remove
for (const r of toRemove) {
  await db.execute(`DELETE FROM collection_items WHERE collection_id = ${yml.id} AND repo_name = '${r.repo_name.replace(/'/g, "''")}'`);
  console.log(`Removed: ${r.repo_name}`);
}

// Add
for (const name of toAdd) {
  const rows = await db.execute(`SELECT repo_id FROM github_events WHERE repo_name = '${name.replace(/'/g, "''")}' AND repo_id IS NOT NULL AND repo_id != 0 ORDER BY id DESC LIMIT 1`);
  if (!rows.length) { console.log(`Skipped (no repo_id): ${name}`); continue; }
  await db.execute(`INSERT INTO collection_items (collection_id, repo_name, repo_id) VALUES (${yml.id}, '${name.replace(/'/g, "''")}', ${rows[0].repo_id})`);
  console.log(`Added: ${name} (repo_id: ${rows[0].repo_id})`);
}

// After
const afterItems = await db.execute(
  `SELECT repo_id, repo_name FROM collection_items WHERE collection_id = ${yml.id} ORDER BY repo_name`
);
console.log(`\n--- After ---`);
console.log(`DB items: ${afterItems.length}`);
afterItems.forEach(r => console.log(`  ${r.repo_name} (repo_id: ${r.repo_id})`));
console.log(`\nDone.`);
