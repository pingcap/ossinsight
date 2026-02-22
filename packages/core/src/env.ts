/**
 * Base environment-variable schema shared across all OSSInsight packages.
 * Each package may extend this with its own additional required fields.
 */
export interface BaseEnvConfig {
  /** TiDB / MySQL connection string. */
  DATABASE_URL: string;
  /** Optional comma-separated list of GitHub personal access tokens. */
  GITHUB_ACCESS_TOKENS?: string[];
  /** pino log level (default: "info"). */
  LOG_LEVEL?: string;
}

/** JSON-schema descriptor usable with `env-schema` or `@fastify/env`. */
export const baseEnvSchema = {
  type: "object",
  required: ["DATABASE_URL"],
  properties: {
    DATABASE_URL: { type: "string" },
    GITHUB_ACCESS_TOKENS: { type: "string", separator: "," },
    LOG_LEVEL: { type: "string", default: "info" },
  },
} as const;
