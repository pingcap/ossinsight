import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const sourceRoot = process.env.OSSINSIGHT_SOURCE_ROOT ?? path.resolve(repoRoot, '../ossinsight');
const docsAppRoot = path.join(repoRoot, 'apps/docs');
const docsContentRoot = path.join(docsAppRoot, 'content');
const docsPublicRoot = path.join(docsAppRoot, 'public');

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureSourceRoot() {
  if (!(await pathExists(sourceRoot))) {
    throw new Error(`Missing OSS Insight source repo at ${sourceRoot}`);
  }
}

async function resetManagedPath(targetPath) {
  await fs.rm(targetPath, { recursive: true, force: true });
}

async function copyManagedDir(sourcePath, targetPath) {
  await resetManagedPath(targetPath);
  await fs.cp(sourcePath, targetPath, { recursive: true });
}

async function syncBlogAssets() {
  const sourceBlogRoot = path.join(sourceRoot, 'web/blog');
  const targetBlogAssetsRoot = path.join(docsPublicRoot, 'blog-assets');
  await resetManagedPath(targetBlogAssetsRoot);
  await fs.mkdir(targetBlogAssetsRoot, { recursive: true });

  const entries = await fs.readdir(sourceBlogRoot, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const from = path.join(sourceBlogRoot, entry.name);
        const to = path.join(targetBlogAssetsRoot, entry.name);
        await fs.cp(from, to, {
          recursive: true,
          filter: (sourceFile) => {
            const base = path.basename(sourceFile);
            return base !== 'index.md' && base !== 'index.mdx';
          },
        });
      }),
  );
}

async function main() {
  await ensureSourceRoot();

  await copyManagedDir(path.join(sourceRoot, 'web/blog'), path.join(docsContentRoot, 'blog'));
  await copyManagedDir(path.join(sourceRoot, 'web/docs'), path.join(docsContentRoot, 'docs'));
  await copyManagedDir(path.join(sourceRoot, 'web/static'), docsPublicRoot);

  await fs.mkdir(path.join(docsContentRoot, 'public_api'), { recursive: true });
  await fs.copyFile(
    path.join(sourceRoot, 'configs/public_api/openapi.yaml'),
    path.join(docsContentRoot, 'public_api/openapi.yaml'),
  );

  await syncBlogAssets();

  console.log(`Synced blog/docs/static content from ${sourceRoot}`);
}

await main();
