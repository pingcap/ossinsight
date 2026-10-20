import { createOpenAI } from "@ai-sdk/openai";

// Regional base URLs for the MiniMax OpenAI-compatible chat API. The Data
// Explorer can be pointed at either the global endpoint or the mainland-China
// endpoint through the MINIMAX_API_REGION environment variable.
export const MINIMAX_REGION_BASE_URLS = {
  global_en: "https://api.minimax.io/v1",
  cn_zh: "https://api.minimax.cn/v1",
} as const;

export type MinimaxRegion = keyof typeof MINIMAX_REGION_BASE_URLS;

export const MINIMAX_DEFAULT_REGION: MinimaxRegion = "global_en";

// Current MiniMax text choices and their context windows (in tokens).
export const MINIMAX_MODELS = {
  "MiniMax-M3.1-Flash": { contextWindow: 1_000_000 },
  "MiniMax-M3": { contextWindow: 1_000_000 },
} as const;

export type MinimaxModelId = keyof typeof MINIMAX_MODELS;

export const MINIMAX_DEFAULT_MODEL: MinimaxModelId = "MiniMax-M3.1-Flash";

export function resolveMinimaxRegion(
  value: string | undefined,
): MinimaxRegion {
  return value && value in MINIMAX_REGION_BASE_URLS
    ? (value as MinimaxRegion)
    : MINIMAX_DEFAULT_REGION;
}

export function resolveMinimaxModel(
  value: string | undefined,
): string {
  // An explicit deployment setting may select a legacy model or a custom route.
  return value?.trim() || MINIMAX_DEFAULT_MODEL;
}

export function resolveMinimaxBaseUrl(
  region: MinimaxRegion,
  override: string | undefined,
): string {
  const url = override?.trim() || MINIMAX_REGION_BASE_URLS[region];
  return url.replace(/\/+$/, "");
}

export interface MinimaxConfig {
  apiKey: string;
  region: MinimaxRegion;
  baseURL: string;
  modelId: string;
}

// Read the MiniMax configuration from the environment. Returns null when no
// MiniMax API key is configured, so callers can keep their existing default
// provider behaviour untouched.
export function readMinimaxConfig(
  env: Record<string, string | undefined> = process.env,
): MinimaxConfig | null {
  const apiKey = env.MINIMAX_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const region = resolveMinimaxRegion(env.MINIMAX_API_REGION);
  return {
    apiKey,
    region,
    baseURL: resolveMinimaxBaseUrl(region, env.MINIMAX_API_BASE_URL),
    modelId: resolveMinimaxModel(env.MINIMAX_MODEL),
  };
}

// Build a language model bound to the MiniMax OpenAI-compatible endpoint.
export function createMinimaxModel(config: MinimaxConfig) {
  const provider = createOpenAI({
    name: "minimax",
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });
  return provider.chat(config.modelId);
}
