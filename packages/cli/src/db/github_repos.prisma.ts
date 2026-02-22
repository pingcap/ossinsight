/**
 * Prisma 7-based GitHub repo helpers for @ossinsight/cli.
 * Replaces the legacy Kysely-based `github_repos.ts`.
 */
import { prisma } from "./prisma.js";
import { Prisma } from "@prisma/client";

export async function findReposByNames(names: string[]) {
  if (names.length === 0) return [];
  // For each name, find the repo with the highest repo_id (latest record).
  const results = await prisma.$queryRaw<
    Array<{ repo_id: number; repo_name: string; owner_id: number; owner_login: string; owner_is_org: boolean }>
  >(Prisma.sql`
    SELECT r.*
    FROM github_repos r
    INNER JOIN (
      SELECT repo_name, MAX(repo_id) AS latest_repo_id
      FROM github_repos
      WHERE repo_name IN (${Prisma.join(names)})
      GROUP BY repo_name
    ) latest ON r.repo_id = latest.latest_repo_id
  `);
  return results;
}

export async function upsertGitHubRepo(repo: {
  repoId: number;
  repoName: string;
  ownerId: number;
  ownerLogin: string;
  ownerIsOrg: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return prisma.gitHubRepo.upsert({
    where: { repoId: repo.repoId },
    create: repo,
    update: {
      repoName: repo.repoName,
      ownerId: repo.ownerId,
      ownerLogin: repo.ownerLogin,
    },
  });
}
