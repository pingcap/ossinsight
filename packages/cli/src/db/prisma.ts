/**
 * Prisma 7 client singleton for @ossinsight/cli.
 *
 * Replaces the legacy Kysely-based `@db/index` module.
 * Usage:
 *   import { prisma } from '@db/prisma';
 *   const collections = await prisma.collection.findMany();
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Gracefully disconnect on process exit. */
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
