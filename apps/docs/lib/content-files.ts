import {promises as fs} from 'node:fs';
import path from 'node:path';

function slugSegments(slug: string, nested = false): string[] | null {
  // Route parameters are already URL-decoded by Next. Never decode again.
  if (typeof slug !== 'string' || slug.length > 512) return null;
  const segments = slug.split('/');
  if (!nested && segments.length !== 1) return null;
  return segments.every(segment => /^[A-Za-z0-9][A-Za-z0-9_.-]{0,179}$/.test(segment)) ? segments : null;
}

function isWithin(root: string, candidate: string) {
  const relative = path.relative(root, candidate);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

/** Return only regular files contained in the configured public content root. */
export async function findContentFile(root: string, relativeCandidates: string[]): Promise<string | null> {
  const absoluteRoot = path.resolve(root);
  let realRoot: string;
  try { realRoot = await fs.realpath(absoluteRoot); }
  catch { return null; }
  for (const relative of relativeCandidates) {
    const candidate = path.resolve(absoluteRoot, relative);
    if (!isWithin(absoluteRoot, candidate)) continue;
    try {
      const realFile = await fs.realpath(candidate);
      if (isWithin(realRoot, realFile) && (await fs.stat(realFile)).isFile()) return realFile;
    } catch {
      // Missing, unreadable and escaped files are all unavailable to the caller.
    }
  }
  return null;
}

export async function resolveBlogSourceFile(root: string, slug: string) {
  if (!slugSegments(slug)) return null;
  return findContentFile(root, [path.join(slug, 'index.mdx'), path.join(slug, 'index.md')]);
}

export async function resolveDocsSourceFile(root: string, slug: string) {
  const segments = slug === '' ? [] : slugSegments(slug, true);
  if (!segments) return null;
  const base = segments.join('/');
  return findContentFile(root, [
    ...(base ? [`${base}.mdx`, `${base}.md`] : []),
    path.join(base, 'index.mdx'), path.join(base, 'index.md'),
    path.join(base, 'overview.mdx'), path.join(base, 'overview.md'),
  ]);
}

export async function resolveApiSourceFile(root: string, slug: string) {
  if (!slugSegments(slug)) return null;
  return findContentFile(root, [`${slug}.api.mdx`, `${slug}.api.md`]);
}
