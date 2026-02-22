/**
 * Prisma 7-based collection helpers for @ossinsight/cli.
 * Replaces the legacy Kysely-based `collections.ts`.
 */
import { prisma } from "./prisma.js";

export async function listAllCollections() {
  return prisma.collection.findMany();
}

export async function listCollections() {
  return prisma.collection.findMany({
    where: { deletedAt: null },
  });
}

export async function insertCollection(data: { name: string }) {
  return prisma.collection.create({ data });
}

export async function updateCollection(data: { id: number; name?: string }) {
  return prisma.collection.update({
    where: { id: data.id },
    data: { name: data.name },
  });
}

export async function deleteCollections(collectionIds: number[]) {
  return prisma.collection.updateMany({
    where: { id: { in: collectionIds } },
    data: { deletedAt: new Date() },
  });
}

export async function listCollectionItems(collectionId: number) {
  return prisma.collectionItem.findMany({
    where: { collectionId, deletedAt: null },
  });
}

export async function addCollectionItems(
  collectionId: number,
  repos: Array<{ repoId: number; repoName: string }>
) {
  // For each repo, find an existing item (including soft-deleted) or create a new one.
  return Promise.all(
    repos.map(async (repo) => {
      const existing = await prisma.collectionItem.findFirst({
        where: { collectionId, repoId: repo.repoId },
      });
      if (existing) {
        return prisma.collectionItem.update({
          where: { id: existing.id },
          data: { deletedAt: null, repoName: repo.repoName },
        });
      }
      return prisma.collectionItem.create({
        data: { collectionId, repoId: repo.repoId, repoName: repo.repoName },
      });
    })
  );
}

export async function removeCollectionItems(
  collectionId: number,
  repoNames: string[]
) {
  return prisma.collectionItem.updateMany({
    where: { collectionId, repoName: { in: repoNames } },
    data: { deletedAt: new Date() },
  });
}
