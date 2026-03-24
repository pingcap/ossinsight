/**
 * Parse SQL schema files and generate Drizzle schema definitions
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { writeFileSync } from 'fs';

const migrationsDir = '/home/ubuntu/.openclaw/workspace/ossinsight/packages/api-server/__tests__/migrations';
const outputDir = '/home/ubuntu/.openclaw/workspace/ossinsight/packages/database/src/schema';

// MySQL to Drizzle type mapping
const typeMap: Record<string, string> = {
  'tinyint(1)': 'boolean',
  'tinyint': 'int',
  'smallint': 'int',
  'mediumint': 'int',
  'int': 'int',
  'bigint': 'bigint',
  'varchar': 'varchar',
  'text': 'text',
  'mediumtext': 'text',
  'longtext': 'text',
  'timestamp': 'timestamp',
  'datetime': 'datetime',
  'date': 'date',
  'json': 'json',
};

function parseCreateTable(sql: string): { tableName: string; columns: any[]; indexes: any[] } | null {
  const tableMatch = sql.match(/CREATE TABLE `(\w+)` \(([\s\S]+)\) ENGINE/);
  if (!tableMatch) return null;

  const tableName = tableMatch[1];
  const columnsPart = tableMatch[2];

  // Parse columns
  const columns: any[] = [];
  const indexes: any[] = [];

  // Split by lines but handle multi-line definitions
  const lines = columnsPart.split(',\n').map(l => l.trim());

  for (const line of lines) {
    // Primary key
    if (line.startsWith('PRIMARY KEY')) {
      const pkMatch = line.match(/PRIMARY KEY \(([^)]+)\)/);
      if (pkMatch) {
        indexes.push({ name: 'PRIMARY', columns: pkMatch[1].split(',').map(c => c.replace(/`/g, '')), unique: true });
      }
      continue;
    }

    // Index
    if (line.startsWith('KEY') || line.startsWith('UNIQUE KEY')) {
      const keyMatch = line.match(/(?:UNIQUE )?KEY `?(\w+)`? \(([^)]+)\)/);
      if (keyMatch) {
        indexes.push({
          name: keyMatch[1],
          columns: keyMatch[2].split(',').map(c => c.replace(/`/g, '').trim()),
          unique: line.startsWith('UNIQUE')
        });
      }
      continue;
    }

    // Column definition
    const colMatch = line.match(/`(\w+)` ([\w()]+)(?:\((\d+)\))?(?: DEFAULT '([^']*)')?(?: NOT NULL)?(?: NULL)?(?: AUTO_INCREMENT)?(?: ON UPDATE CURRENT_TIMESTAMP)?/);
    if (colMatch) {
      const colName = colMatch[1];
      const colType = colMatch[2];
      const defaultValue = colMatch[4];

      columns.push({
        name: colName,
        type: colType,
        defaultValue,
        notNull: !line.includes('DEFAULT NULL') && !line.includes('NULL') && !line.includes('timestamp NULL'),
      });
    }
  }

  return { tableName, columns, indexes };
}

function generateDrizzleSchema(table: ReturnType<typeof parseCreateTable>): string {
  if (!table) return '';

  const { tableName, columns, indexes } = table;

  // Convert table name to camelCase
  const schemaName = tableName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  const pascalName = schemaName.charAt(0).toUpperCase() + schemaName.slice(1);

  let output = `/**\n * ${tableName} schema\n */\n\n`;
  output += `import {\n`;
  output += `  mysqlTable,\n`;
  output += `  bigint,\n`;
  output += `  int,\n`;
  output += `  varchar,\n`;
  output += `  text,\n`;
  output += `  boolean,\n`;
  output += `  timestamp,\n`;
  output += `  datetime,\n`;
  output += `  date,\n`;
  output += `  json,\n`;
  output += `  index,\n`;
  output += `  uniqueIndex,\n`;
  output += `} from 'drizzle-orm/mysql-core';\n\n`;

  output += `export const ${schemaName} = mysqlTable(\n`;
  output += `  '${tableName}',\n`;
  output += `  {\n`;

  // Generate columns
  for (const col of columns) {
    const drizzleType = typeMap[col.type] || 'varchar';
    const colName = col.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    
    let typeDef = '';
    if (drizzleType === 'varchar' || drizzleType === 'text') {
      const sizeMatch = col.type.match(/\((\d+)\)/);
      const size = sizeMatch ? sizeMatch[1] : '255';
      typeDef = `${drizzleType}('${colName}', { length: ${size} })`;
    } else if (drizzleType === 'bigint') {
      typeDef = `bigint('${colName}', { mode: 'number' })`;
    } else if (drizzleType === 'timestamp' || drizzleType === 'datetime') {
      typeDef = `${drizzleType}('${colName}', { mode: 'string', fsp: 3 })`;
    } else if (drizzleType === 'boolean') {
      typeDef = `boolean('${colName}')`;
    } else if (drizzleType === 'int') {
      typeDef = `int('${colName}')`;
    } else if (drizzleType === 'date') {
      typeDef = `date('${colName}', { mode: 'string' })`;
    } else if (drizzleType === 'json') {
      typeDef = `json('${colName}')`;
    }

    // Add default value
    if (col.defaultValue !== undefined && col.defaultValue !== 'NULL') {
      if (col.defaultValue === '0' || col.defaultValue === '0000-00-00 00:00:00') {
        typeDef += `.default(0)`;
      } else if (col.defaultValue === "''") {
        typeDef += `.default('')`;
      } else if (col.defaultValue === 'CURRENT_TIMESTAMP') {
        typeDef += `.defaultNow()`;
      } else {
        typeDef += `.default('${col.defaultValue}')`;
      }
    }

    // Add not null
    if (col.notNull && col.defaultValue === undefined) {
      typeDef += `.notNull()`;
    } else if (col.notNull) {
      typeDef += `.notNull()`;
    }

    // Add primary key
    const isPk = indexes.some(idx => idx.name === 'PRIMARY' && idx.columns.includes(col.name));
    if (isPk) {
      typeDef += `.primaryKey()`;
    }

    output += `    ${colName}: ${typeDef},\n`;
  }

  output += `  },\n`;
  output += `  (table) => ({\n`;

  // Generate indexes
  for (const idx of indexes) {
    if (idx.name === 'PRIMARY') continue;

    const indexName = idx.name.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    const indexCols = idx.columns.map(c => c.replace(/_([a-z])/g, (g) => g[1].toUpperCase()));
    const indexType = idx.unique ? 'uniqueIndex' : 'index';

    output += `    ${indexName}: ${indexType}('${idx.name}').on(`;
    output += indexCols.map(c => `table.${c}`).join(', ');
    output += `),\n`;
  }

  output += `  })\n`;
  output += `);\n\n`;

  // Type exports
  output += `// Type inference\n`;
  output += `export type ${pascalName} = typeof ${schemaName}.$inferSelect;\n`;
  output += `export type New${pascalName} = typeof ${schemaName}.$inferInsert;\n`;

  return output;
}

async function main() {
  const files = await readdir(migrationsDir);
  const schemaFiles = files.filter(f => f.endsWith('-schema.sql') && !f.includes('mv_'));

  console.log(`Found ${schemaFiles.length} schema files\n`);

  const generatedSchemas: string[] = [];

  for (const file of schemaFiles) {
    const filePath = join(migrationsDir, file);
    const content = await readFile(filePath, 'utf-8');

    const table = parseCreateTable(content);
    if (!table) {
      console.log(`⚠️  Skipped ${file} (parse failed)`);
      continue;
    }

    const drizzleSchema = generateDrizzleSchema(table);
    const outputFileName = file.replace('-schema.sql', '.ts');
    const outputPath = join(outputDir, outputFileName);

    writeFileSync(outputPath, drizzleSchema);
    generatedSchemas.push(outputFileName.replace('.ts', ''));

    console.log(`✅ Generated ${outputFileName}`);
  }

  // Update schema/index.ts
  let indexContent = `/**\n * Schema Index\n * \n * Central export for all database schemas\n */\n\n`;
  indexContent += `// Auto-generated schema exports\n`;
  for (const schema of generatedSchemas) {
    indexContent += `export * from './${schema}.js';\n`;
  }

  writeFileSync(join(outputDir, 'index.ts'), indexContent);
  console.log(`\n✅ Updated schema/index.ts`);
  console.log(`\nTotal schemas generated: ${generatedSchemas.length}`);
}

main().catch(console.error);
