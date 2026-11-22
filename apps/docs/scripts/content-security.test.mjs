import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {renderToStaticMarkup} from 'react-dom/server';
import {MarkdownAsync} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import {markdownRehypePlugins, normalizeMarkdownSource} from '../lib/markdown-security.mjs';

async function render(source, assetBase) {
  return renderToStaticMarkup(await MarkdownAsync({
    children: normalizeMarkdownSource(source, assetBase),
    rehypePlugins: markdownRehypePlugins, remarkPlugins: [remarkGfm],
  }));
}

function assertSafe(html) {
  assert.doesNotMatch(html, /<(?:script|style|svg|math|object|embed|form)\b/i);
  assert.doesNotMatch(html, /<[a-z][^>]*\son[a-z]+\s*=/i);
  assert.doesNotMatch(html, /\ssrcdoc\s*=/i);
  assert.doesNotMatch(html, /\s(?:href|src)=["'](?:javascript|vbscript|data):/i);
}

for (const [name, source] of [
  ['script', '<script>alert("fixture")</script>'],
  ['event handler', '<img src="/safe.png" onerror="alert(1)" style="position:fixed">'],
  ['javascript URL', '<a href="JaVaScRiPt:alert(1)">click</a>'],
  ['encoded URL', '<a href="java&#x09;script:alert(1)">click</a>'],
  ['HTML data URL', '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>'],
  ['srcdoc', '<iframe srcdoc="<script>alert(1)</script>"></iframe>'],
  ['foreign content', '<svg><foreignObject><iframe srcdoc="bad"></iframe></foreignObject></svg>'],
  ['MathML', '<math><annotation-xml encoding="text/html"><img src=x onerror=alert(1)></annotation-xml></math>'],
  ['object', '<object data="javascript:alert(1)"></object><embed src="/bad">'],
  ['form', '<form action="https://example.invalid"><input name="password"><button>send</button></form>'],
]) test(`raw Markdown cannot activate ${name}`, async () => {assertSafe(await render(source));});

test('heading IDs and fragment links retain sanitizer clobber protection', async () => {
  const html = await render('[TOC](#location)\n\n# Location\n\n<a name="old-heading"></a>\n[Old](#old-heading)\n\nNote[^1]\n\n[^1]: Footnote.');
  assert.match(html, /id="user-content-location"/);
  assert.doesNotMatch(html, /(?:id|name)="(?:location|old-heading)"/);
  const ids = new Set([...html.matchAll(/(?:id|name)="([^"]+)"/g)].map(match => match[1]));
  for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) {
    assert(ids.has(decodeURIComponent(fragment)), `Dangling fragment: ${fragment}`);
  }
});

test('trusted highlighting runs after sanitization and keeps code examples inert', async () => {
  const html = await render('```html\n<script>alert(1)</script>\n```');
  assertSafe(html);
  assert.match(html, /data-rehype-pretty-code/);
  assert.match(html, /&lt;/);
});

test('local videos survive without event handlers', async () => {
  const html = await render('<video src="/blog-assets/demo.mp4" autoPlay controls onplay="alert(1)"></video>');
  assertSafe(html);
  assert.match(html, /<video[^>]+src="\/blog-assets\/demo.mp4"/);
  assert.match(html, /controls=""/);
});

test('YouTube embeds receive fixed sandbox permissions and cannot supply srcdoc', async () => {
  const html = await render('<iframe src="https://www.youtube.com/embed/6ofDBgXh4So?enablejsapi=1" srcdoc="bad" sandbox="allow-top-navigation"></iframe>');
  assertSafe(html);
  assert.match(html, /<iframe/);
  assert.match(html, /sandbox="allow-scripts allow-same-origin allow-presentation"/);
  assert.doesNotMatch(html, /allow-top-navigation/);
});

for (const url of ['https://example.invalid/embed/6ofDBgXh4So',
  'https://www.youtube.com.example.invalid/embed/6ofDBgXh4So',
  'https://user@www.youtube.com/embed/6ofDBgXh4So', 'https://www.youtube.com/redirect?q=bad']) {
  test(`unapproved iframe destination ${url} is removed`, async () => {
    assert.doesNotMatch(await render(`<iframe src="${url}"></iframe>`), /<iframe/);
  });
}

test('all published blog content renders through the production sanitizer pipeline', async () => {
  const root = new URL('../content/blog/', import.meta.url);
  let checked = 0;
  for (const entry of await readdir(root, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    let source;
    for (const file of ['index.mdx', 'index.md']) {
      try {source = await readFile(new URL(`${entry.name}/${file}`, root), 'utf8'); break;}
      catch (error) {if (error.code !== 'ENOENT') throw error;}
    }
    if (!source) continue;
    const html = await render(matter(source).content, `/blog-assets/${entry.name}`);
    assertSafe(html);
    assert(html.length > 0, entry.name);
    checked++;
  }
  assert(checked > 0);
});
