/**
 * @ossinsight/core
 *
 * Single source of truth for the OSSInsight monorepo:
 *  - Prisma 7 schema  (prisma/schema.prisma)
 *  - PrismaClient singleton
 *  - Shared logger
 *  - Base env-config schema
 */

// Database client & generated types
export { db, PrismaClient } from "./db/client";
export type {
  GithubEvent,
  GitHubRepo,
  GitHubRepoLanguage,
  GitHubRepoTopic,
  GitHubUser,
  Collection,
  CollectionItem,
  ImportLog,
  LocationCacheItem,
  User,
} from "@prisma/client";
export { Prisma } from "@prisma/client";

// Shared logger
export { logger } from "./logger";

// Shared env-config types & schema
export type { BaseEnvConfig } from "./env";
export { baseEnvSchema } from "./env";
