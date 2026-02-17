import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { CollectionConfig } from '@ossinsight/types';
import pino from 'pino';

const logger = pino({ name: 'config-collections' });

/**
 * Load all collection configs from the configs/collections directory.
 * Files are named: {id}.{name}.yml
 */
export async function loadCollections(configsPath: string): Promise<CollectionConfig[]> {
  const collectionsDir = join(configsPath, 'collections');
  const files = await readdir(collectionsDir);
  const yamlFiles = files.filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));

  const collections: CollectionConfig[] = [];

  for (const file of yamlFiles) {
    try {
      const content = await readFile(join(collectionsDir, file), 'utf-8');
      const config = parseYaml(content) as CollectionConfig;
      collections.push(config);
    } catch (error) {
      logger.error({ file, error }, 'Failed to load collection config');
    }
  }

  logger.info({ count: collections.length }, 'Collections loaded');
  return collections.sort((a, b) => a.id - b.id);
}

/**
 * Load a single collection config by ID.
 */
export async function loadCollectionById(
  configsPath: string,
  id: number,
): Promise<CollectionConfig | null> {
  const collectionsDir = join(configsPath, 'collections');
  const files = await readdir(collectionsDir);
  const match = files.find((f) => f.startsWith(`${id}.`));
  if (!match) return null;

  const content = await readFile(join(collectionsDir, match), 'utf-8');
  return parseYaml(content) as CollectionConfig;
}
