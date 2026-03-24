/**
 * Fix column names in generated schemas to use snake_case
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const schemaDir = '/home/ubuntu/.openclaw/workspace/ossinsight/packages/database/src/schema';

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

async function main() {
  const files = await readdir(schemaDir);
  const tsFiles = files.filter(f => f.endsWith('.ts') && f !== 'index.ts');

  for (const file of tsFiles) {
    const filePath = join(schemaDir, file);
    let content = await readFile(filePath, 'utf-8');

    // Fix column names in field definitions: repoId: -> repo_id:
    content = content.replace(/(\s+)([a-z]+[A-Z][a-zA-Z]*):/g, (match, space, name) => {
      const snakeCase = toSnakeCase(name);
      return `${space}${snakeCase}:`;
    });

    // Fix column names in index definitions: table.repoId -> table.repo_id
    content = content.replace(/table\.([a-z]+[A-Z][a-zA-Z]*)/g, (match, name) => {
      return `table.${toSnakeCase(name)}`;
    });

    await writeFile(filePath, content);
    console.log(`✅ Fixed ${file}`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
