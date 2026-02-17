import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import type { PipelineConfig } from '@ossinsight/types';
import pino from 'pino';

const logger = pino({ name: 'config-pipelines' });

export interface LoadedPipeline {
  name: string;
  config: PipelineConfig;
  processSql: string;
}

/**
 * Load all pipeline definitions from configs/pipelines directory.
 */
export async function loadPipelines(configsPath: string): Promise<Map<string, LoadedPipeline>> {
  const pipelinesDir = join(configsPath, 'pipelines');
  const entries = await readdir(pipelinesDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());

  const pipelines = new Map<string, LoadedPipeline>();

  for (const dir of dirs) {
    try {
      const pipeline = await loadPipeline(configsPath, dir.name);
      if (pipeline) {
        pipelines.set(dir.name, pipeline);
      }
    } catch (error) {
      logger.error({ pipeline: dir.name, error }, 'Failed to load pipeline config');
    }
  }

  logger.info({ count: pipelines.size }, 'Pipelines loaded');
  return pipelines;
}

/**
 * Load a single pipeline by name.
 */
export async function loadPipeline(
  configsPath: string,
  pipelineName: string,
): Promise<LoadedPipeline | null> {
  const pipelineDir = join(configsPath, 'pipelines', pipelineName);

  const configPath = join(pipelineDir, 'config.json');
  const sqlPath = join(pipelineDir, 'process.sql');

  try {
    await access(configPath);
    await access(sqlPath);
  } catch {
    return null;
  }

  const configContent = await readFile(configPath, 'utf-8');
  const config = JSON.parse(configContent) as PipelineConfig;
  const processSql = await readFile(sqlPath, 'utf-8');

  return { name: pipelineName, config, processSql };
}
