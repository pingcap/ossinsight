import fp from 'fastify-plugin';
import fs from 'node:fs';
import path from 'node:path';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { positiveId } from '../../../../core/playground/sql-policy';
import { APIError } from '../../../../utils/error';

declare module 'fastify' {
  interface FastifyInstance { promptTemplateManager: PromptManager; }
}

export default fp(async app => {
  app.decorate('promptTemplateManager', new PromptManager(
    path.join(app.config.CONFIGS_PATH, 'prompts'),
  ));
}, { name: '@ossinsight/prompt-template-manager', dependencies: ['@fastify/env'] });

export interface PromptConfig {
  model: string;
  stop?: string[];
  max_tokens: number;
  temperature: number;
  top_p: number;
  n: number;
}

function boundedText(value: unknown, name: string, max: number): string {
  if (typeof value !== 'string' || value.length > max || (name === 'question' && !value.trim())) {
    throw new APIError(400, `Invalid ${name}`);
  }
  return value;
}

export class PromptManager {
  constructor(private readonly directory: string) {}

  public async getPrompt(name: string, context: Record<string, any>): Promise<[ChatCompletionMessageParam[], PromptConfig]> {
    if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Invalid prompt name');
    // Resolve a release symlink once so the config and instructions come from the
    // same release. Read per request: deletion/disablement cannot leave stale policy.
    const directory = fs.realpathSync(path.join(this.directory, name));
    const raw = JSON.parse(fs.readFileSync(path.join(directory, 'config.json'), 'utf8'));
    if (raw.input_format !== 'messages-v1' || raw.enabled !== true) {
      throw new APIError(503, 'This prompt is unavailable');
    }
    const instructions = fs.readFileSync(path.join(directory, 'template.mustache'), 'utf8');
    if (!instructions.trim() || instructions.includes('{{')) {
      throw new Error('System instructions must not interpolate request or retrieval data');
    }
    const { model, stop, max_tokens, temperature, top_p, n } = raw;
    if (typeof model !== 'string' || !model || !Array.isArray(stop) ||
        !stop.every((s: unknown) => typeof s === 'string') ||
        !Number.isInteger(max_tokens) || max_tokens < 1 || max_tokens > 4096 ||
        temperature !== 0 || top_p !== 1 || n !== 1) {
      throw new Error('Invalid prompt configuration');
    }
    const data: Record<string, unknown> = {
      question: boundedText(context.question, 'question', 4000),
    };
    if (name === 'playground-generate-sql') {
      data.repo_id = positiveId(context.repo_id);
      // Identity is bound locally to named SQL parameters after generation.
      // Neither session identifiers nor caller-supplied identity leave the service.
      data.authenticated_github_identity_available = context.github_id != null;
    }
    for (const key of name === 'embedding-explorer-generate-answer' ? ['entities', 'examples'] : []) {
      if (context[key] != null) data[key] = boundedText(context[key], key, 24000);
    }
    // An empty stop array is not a valid OpenAI request value; omit it instead.
    return [[
      { role: 'system', content: instructions },
      { role: 'user', content: JSON.stringify(data) },
    ], { model, max_tokens, temperature, top_p, n, ...(stop.length ? { stop } : {}) }];
  }
}
