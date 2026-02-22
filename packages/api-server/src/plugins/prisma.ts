import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

/**
 * @ossinsight/prisma plugin
 *
 * Initialises a shared Prisma 7 client and attaches it to the Fastify instance.
 * Packages that need type-safe queries should use `app.prisma` instead of the
 * raw `app.mysql` pool where possible.
 *
 * Usage:
 *   const repos = await app.prisma.gitHubRepo.findMany({ take: 10 });
 */
export default fp(
  async (app) => {
    const prisma = new PrismaClient({
      datasourceUrl: app.config.DATABASE_URL,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

    await prisma.$connect();

    app.decorate("prisma", prisma);

    app.addHook("onClose", async () => {
      await prisma.$disconnect();
    });
  },
  {
    name: "@ossinsight/prisma",
    dependencies: ["@fastify/env"],
  }
);

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
