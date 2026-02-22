import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Singleton Prisma client (one per process)
// Usage:
//   import { db } from '@ossinsight/db';
//   const repos = await db.gitHubRepo.findMany({ take: 10 });
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Re-export generated types so consumers don't need to depend on @prisma/client directly.
export * from "@prisma/client";
