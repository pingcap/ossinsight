import {promises as fs} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {findContentFile, resolveApiSourceFile, resolveBlogSourceFile, resolveDocsSourceFile} from '../../../../apps/docs/lib/content-files';

let fixture: string;
let root: string;
let outside: string;

beforeAll(async () => {
  fixture = await fs.mkdtemp(path.join(os.tmpdir(), 'ossinsight-content-paths-'));
  root = path.join(fixture, 'content');
  outside = path.join(fixture, 'content-private');
  for (const folder of ['content/post', 'content/guide', 'content/only-directory.api.mdx', 'content-private']) {
    await fs.mkdir(path.join(fixture, folder), {recursive: true});
  }
  for (const [name, text] of Object.entries({
    'content/post/index.md': 'public blog',
    'content/guide/overview.mdx': 'public guide',
    'content/guide/topic.md': 'nested topic',
    'content/list.api.mdx': 'public API',
    'content/legacy.api.md': 'legacy API',
    'content/index.md': 'public docs root',
    'content-private/index.mdx': 'private blog fixture',
    'content-private/guide.md': 'private guide fixture',
    'content-private/stolen.api.mdx': 'private API fixture',
  })) await fs.writeFile(path.join(fixture, name), text);
  await fs.symlink(outside, path.join(root, 'escape'));
  await fs.symlink(path.join(outside, 'stolen.api.mdx'), path.join(root, 'escape.api.mdx'));
  await fs.symlink(path.join(root, 'post'), path.join(root, 'safe-alias'));
});
afterAll(async () => {await fs.rm(fixture, {recursive: true, force: true});});

test.each(['.', '..', '../content-private', '/absolute', 'post/../../content-private',
  'post\\..\\content-private', '..%2fcontent-private', '%2e%2e', '%252e%252e',
  'post%2findex', 'post%252findex', 'post\0hidden', 'post?hidden', 'post#hidden',
  'post//child', 'post/', '/post', 'a'.repeat(181), 'a/'.repeat(260)])(
  'malformed or traversal slug %j never resolves content', async slug => {
    expect(await resolveBlogSourceFile(root, slug)).toBeNull();
    expect(await resolveApiSourceFile(root, slug)).toBeNull();
    expect(await resolveDocsSourceFile(root, slug)).toBeNull();
  },
);

test('each resolver rejects an existing file outside its root', async () => {
  expect(await resolveBlogSourceFile(root, '../content-private')).toBeNull();
  expect(await resolveDocsSourceFile(root, '../content-private/guide')).toBeNull();
  expect(await resolveApiSourceFile(root, '../content-private/stolen')).toBeNull();
  expect(await findContentFile(root, ['../content-private/guide.md'])).toBeNull();
  expect(await findContentFile(root, [path.join(outside, 'guide.md')])).toBeNull();
});

test('symlink targets must remain inside the real root, including prefix-sibling directories', async () => {
  expect(await resolveBlogSourceFile(root, 'escape')).toBeNull();
  expect(await resolveDocsSourceFile(root, 'escape/guide')).toBeNull();
  expect(await resolveApiSourceFile(root, 'escape')).toBeNull();
  const safe = await resolveBlogSourceFile(root, 'safe-alias');
  expect(safe).toBe(await fs.realpath(path.join(root, 'post/index.md')));
});

test('normal blog, nested docs, root docs and API extension fallbacks remain readable', async () => {
  const paths = [
    [await resolveBlogSourceFile(root, 'post'), 'public blog'],
    [await resolveDocsSourceFile(root, 'guide'), 'public guide'],
    [await resolveDocsSourceFile(root, 'guide/topic'), 'nested topic'],
    [await resolveDocsSourceFile(root, ''), 'public docs root'],
    [await resolveApiSourceFile(root, 'list'), 'public API'],
    [await resolveApiSourceFile(root, 'legacy'), 'legacy API'],
  ];
  for (const [file, expected] of paths) {
    expect(file).not.toBeNull();
    expect(await fs.readFile(file!, 'utf8')).toBe(expected);
  }
});

test('directories, nonexistent content and empty single-segment slugs return no file', async () => {
  expect(await resolveApiSourceFile(root, 'only-directory')).toBeNull();
  expect(await resolveApiSourceFile(root, 'missing')).toBeNull();
  expect(await resolveBlogSourceFile(root, '')).toBeNull();
  expect(await resolveApiSourceFile(root, '')).toBeNull();
  expect(await findContentFile(root, ['.'])).toBeNull();
  expect(await findContentFile(path.join(fixture, 'missing'), ['index.md'])).toBeNull();
});

test('all currently published blog and API slugs satisfy the new boundary', async () => {
  const docs = path.resolve(__dirname, '../../../../apps/docs');
  const blogs = path.join(docs, 'content/blog');
  const api = path.join(docs, 'legacy-content/docs/api');
  let checked = 0;
  for (const entry of await fs.readdir(blogs, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    expect(await resolveBlogSourceFile(blogs, entry.name)).not.toBeNull();
    checked++;
  }
  for (const entry of await fs.readdir(api, {withFileTypes: true})) {
    if (!entry.isFile() || !/\.api\.mdx?$/.test(entry.name)) continue;
    expect(await resolveApiSourceFile(api, entry.name.replace(/\.api\.mdx?$/, ''))).not.toBeNull();
    checked++;
  }
  expect(checked).toBeGreaterThan(10);
});
