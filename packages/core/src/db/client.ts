import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Singleton Prisma client (one per process).
//
// All packages in this monorepo should import `db` from here rather than
// creating their own PrismaClient instances or maintaining their own
// prisma/schema.prisma files.
//
// Usage:
//   import { db } from '@ossinsight/core';
//   const repos = await db.gitHubRepo.findMany({ take: 10 });
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as { _ossinsightDb?: PrismaClient };

export const db: PrismaClient =
  globalForPrisma._ossinsightDb ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma._ossinsightDb = db;
}

// Re-export the client class and generated types so consumers don't need to
// depend on @prisma/client directly.
export { PrismaClient } from "@prisma/client";
export * from "@prisma/client";
