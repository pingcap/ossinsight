import { cache } from 'react';
import type { ReactNode } from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { MarkdownAsync } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import YAML from 'yaml';
import { docsMdxComponents } from '@/lib/mdx-components';

const CONTENT_ROOT = path.join(process.cwd(), 'content');
const BLOG_ROOT = path.join(CONTENT_ROOT, 'blog');
const DOCS_ROOT = path.join(process.cwd(), 'legacy-content', 'docs');

const prettyCodeOptions = {
  theme: 'one-dark-pro',
  keepBackground: false,
  bypassInlineCode: true,
  defaultLang: {
    block: 'plaintext',
    inline: 'plaintext',
  },
  onVisitLine(node: { children: Array<unknown> }) {
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
};

type AuthorRecord = {
  image_url?: string;
  name?: string;
  title?: string;
  url?: string;
};

type ContentFrontmatter = {
  authors?: string[];
  date?: Date | string;
  description?: string;
  hide_title?: boolean;
  image?: string;
  keywords?: string[];
  sidebar_label?: string;
  slug?: string;
  tags?: string[];
  title?: string;
};

type ApiParameter = {
  description?: string;
  example?: unknown;
  in?: string;
  name?: string;
  required?: boolean;
  schema?: {
    default?: unknown;
    enum?: unknown[];
    example?: unknown;
    type?: string;
  };
};

type ApiMetadata = {
  description?: string;
  info?: {
    description?: string;
    title?: string;
  };
  method?: string;
  operationId?: string;
  parameters?: ApiParameter[];
  path?: string;
  responses?: Record<string, {
    content?: Record<string, {
      schema?: {
        example?: unknown;
      };
    }>;
    description?: string;
  }>;
  servers?: Array<{
    url?: string;
  }>;
  tags?: string[];
};

type ApiFrontmatter = ContentFrontmatter & {
  api?: ApiMetadata;
  id?: string;
};

export type ContentAuthor = {
  imageUrl?: string;
  name: string;
  title?: string;
  url?: string;
};

export type BlogPostSummary = {
  authors: ContentAuthor[];
  date: string | null;
  description: string;
  image?: string;
  readingTime: string;
  slug: string;
  tags: string[];
  title: string;
};

export type BlogPost = BlogPostSummary & {
  content: ReactNode;
};

export type DocsPage = {
  content: ReactNode;
  description: string;
  hideTitle: boolean;
  section: 'docs';
  title: string;
};

export type ApiDocSummary = {
  description: string;
  method: string;
  path: string;
  slug: string;
  tags: string[];
  title: string;
};

export type ApiDoc = ApiDocSummary & {
  parameters: ApiParameter[];
  responseExample: string | null;
  responseStatus: string;
  serverUrl: string;
  sourcePath: string;
};

export type ApiOverview = {
  description: string;
  sourcePath: string;
  title: string;
};

function normalizeDate(value: Date | string | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

export function formatDisplayDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

function normalizeTitle(filePath: string) {
  return path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, ' ');
}

function toPublicAssetPath(assetPath: string, assetBasePath: string) {
  if (assetPath.startsWith('./')) {
    return `${assetBasePath}/${assetPath.slice(2)}`;
  }

  if (assetPath.startsWith('@site/blog/')) {
    return `/blog-assets/${assetPath.slice('@site/blog/'.length)}`;
  }

  return assetPath;
}

function quoteMarkdownBlock(text: string) {
  return text
    .trim()
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n');
}

function normalizeAdmonitions(source: string) {
  return source.replace(/^:::(\w+)\s*\n([\s\S]*?)^:::\s*$/gm, (_match, rawType: string, body: string) => {
    const type = rawType.toLowerCase();
    const labelMap: Record<string, string> = {
      danger: 'Caution',
      info: 'Note',
      note: 'Note',
      tip: 'Tip',
      warning: 'Warning',
    };
    const label = labelMap[type] ?? 'Note';

    return `> **${label}**\n>\n${quoteMarkdownBlock(body)}`;
  });
}

function normalizeSource(source: string, assetBasePath?: string) {
  let nextSource = source.replace(/<!--truncate-->/g, '');
  nextSource = normalizeAdmonitions(nextSource);

  if (!assetBasePath) {
    return nextSource;
  }

  nextSource = nextSource.replace(/src=\{require\((['"])(\.\/[^'"]+|@site\/blog\/[^'"]+)\1\)\.default\}/g, (_match, _quote, assetPath: string) => {
    return `src="${toPublicAssetPath(assetPath, assetBasePath)}"`;
  });

  nextSource = nextSource.replace(/!\[([^\]]*)\]\(\.\/([^)]+)\)/g, (_match, altText: string, assetPath: string) => {
    return `![${altText}](${toPublicAssetPath(`./${assetPath}`, assetBasePath)})`;
  });

  nextSource = nextSource.replace(/<img([^>]*?)src=["']\.\/([^"']+)["']([^>]*)>/g, (_match, before: string, assetPath: string, after: string) => {
    return `<img${before}src="${toPublicAssetPath(`./${assetPath}`, assetBasePath)}"${after}>`;
  });

  return nextSource;
}

async function renderMarkdown(source: string, assetBasePath?: string) {
  const normalizedSource = normalizeSource(source, assetBasePath);
  return (
    <MarkdownAsync
      components={docsMdxComponents}
      rehypePlugins={[
        rehypeRaw,
        [rehypePrettyCode, prettyCodeOptions],
        rehypeSlug,
        [rehypeAutolinkHeadings, {
          behavior: 'append',
          properties: {
            ariaLabel: 'Permalink',
            className: ['anchor-link'],
          },
        }],
      ]}
      remarkPlugins={[remarkGfm]}
    >
      {normalizedSource}
    </MarkdownAsync>
  );
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findFirstExistingFile(candidates: string[]) {
  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function resolveBlogSourceFile(slug: string) {
  const blogDir = path.join(BLOG_ROOT, slug);
  return findFirstExistingFile([
    path.join(blogDir, 'index.mdx'),
    path.join(blogDir, 'index.md'),
  ]);
}

async function resolveDocsSourceFile(slugPath: string) {
  const segments = slugPath.split('/').filter(Boolean);
  const absoluteBase = path.join(DOCS_ROOT, ...segments);

  return findFirstExistingFile([
    `${absoluteBase}.mdx`,
    `${absoluteBase}.md`,
    path.join(absoluteBase, 'index.mdx'),
    path.join(absoluteBase, 'index.md'),
    path.join(absoluteBase, 'overview.mdx'),
    path.join(absoluteBase, 'overview.md'),
  ]);
}

const loadAuthors = cache(async () => {
  const authorsSource = await fs.readFile(path.join(process.cwd(), 'legacy-content', 'blog-authors.yml'), 'utf8');
  return YAML.parse(authorsSource) as Record<string, AuthorRecord>;
});

function buildAuthors(authorIds: string[] | undefined, authorMap: Record<string, AuthorRecord>) {
  return (authorIds ?? []).map((authorId) => {
    const author = authorMap[authorId];

    return {
      imageUrl: author?.image_url,
      name: author?.name ?? authorId,
      title: author?.title,
      url: author?.url,
    };
  });
}

function toBlogSummary(slug: string, filePath: string, data: ContentFrontmatter, rawSource: string, authorsMap: Record<string, AuthorRecord>): BlogPostSummary {
  const normalizedDate = normalizeDate(data.date);
  const assetBasePath = `/blog-assets/${slug}`;
  const image = data.image ? toPublicAssetPath(data.image, assetBasePath) : undefined;

  return {
    authors: buildAuthors(data.authors, authorsMap),
    date: normalizedDate,
    description: data.description ?? '',
    image,
    readingTime: readingTime(rawSource).text,
    slug,
    tags: data.tags ?? [],
    title: data.title ?? normalizeTitle(filePath),
  };
}

export const getBlogPosts = cache(async () => {
  const authorsMap = await loadAuthors();
  const entries = await fs.readdir(BLOG_ROOT, { withFileTypes: true });
  const posts = await Promise.all(entries
    .filter((entry) => entry.isDirectory())
    .map(async (entry) => {
      const filePath = await resolveBlogSourceFile(entry.name);

      if (!filePath) {
        return null;
      }

      const source = await fs.readFile(filePath, 'utf8');
      const { content, data } = matter(source);

      return toBlogSummary(entry.name, filePath, data as ContentFrontmatter, content, authorsMap);
    }));

  return posts
    .filter((post): post is BlogPostSummary => post !== null)
    .sort((left, right) => {
      const leftTime = left.date ? new Date(left.date).getTime() : 0;
      const rightTime = right.date ? new Date(right.date).getTime() : 0;
      return rightTime - leftTime;
    });
});

export const getBlogPost = cache(async (slug: string) => {
  const filePath = await resolveBlogSourceFile(slug);

  if (!filePath) {
    return null;
  }

  const authorsMap = await loadAuthors();
  const source = await fs.readFile(filePath, 'utf8');
  const { content, data } = matter(source);
  const summary = toBlogSummary(slug, filePath, data as ContentFrontmatter, content, authorsMap);
  const renderedContent = await renderMarkdown(content, `/blog-assets/${slug}`);

  return {
    ...summary,
    content: renderedContent,
  } satisfies BlogPost;
});

export const getBlogSummaryBySlug = cache(async (slug: string) => {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
});

export const getDocsPage = cache(async (slugPath: string) => {
  const filePath = await resolveDocsSourceFile(slugPath);

  if (!filePath) {
    return null;
  }

  const source = await fs.readFile(filePath, 'utf8');
  const { content, data } = matter(source);
  const frontmatter = data as ContentFrontmatter;

  return {
    content: await renderMarkdown(content),
    description: frontmatter.description ?? '',
    hideTitle: Boolean(frontmatter.hide_title),
    section: 'docs',
    title: frontmatter.title ?? normalizeTitle(filePath),
  } satisfies DocsPage;
});

function normalizeApiDocPath(fileName: string) {
  return fileName
    .replace(/\.api\.mdx$/, '')
    .replace(/\.api\.md$/, '')
    .replace(/\.info\.mdx$/, '')
    .replace(/\.info\.md$/, '');
}

function extractResponseExample(api: ApiMetadata | undefined) {
  if (!api?.responses) {
    return null;
  }

  const [status, response] = Object.entries(api.responses)[0] ?? [];

  if (!status || !response) {
    return null;
  }

  const schema = response.content?.['application/json']?.schema;

  return {
    example: schema?.example ? JSON.stringify(schema.example, null, 2) : null,
    status,
  };
}

export const getApiDocs = cache(async () => {
  const apiRoot = path.join(DOCS_ROOT, 'api');
  const files = await fs.readdir(apiRoot);
  const apiDocs = await Promise.all(files
    .filter((fileName) => fileName.endsWith('.api.mdx') || fileName.endsWith('.api.md'))
    .map(async (fileName) => {
      const filePath = path.join(apiRoot, fileName);
      const source = await fs.readFile(filePath, 'utf8');
      const { data } = matter(source);
      const frontmatter = data as ApiFrontmatter;

      return {
        description: frontmatter.description ?? frontmatter.api?.description ?? '',
        method: frontmatter.api?.method?.toUpperCase() ?? 'GET',
        path: frontmatter.api?.path ?? '/',
        slug: normalizeApiDocPath(fileName),
        tags: frontmatter.api?.tags ?? [],
        title: frontmatter.title ?? normalizeTitle(filePath),
      } satisfies ApiDocSummary;
    }));

  return apiDocs.sort((left, right) => left.title.localeCompare(right.title));
});

export const getApiDoc = cache(async (slug: string) => {
  const apiRoot = path.join(DOCS_ROOT, 'api');
  const filePath = await findFirstExistingFile([
    path.join(apiRoot, `${slug}.api.mdx`),
    path.join(apiRoot, `${slug}.api.md`),
  ]);

  if (!filePath) {
    return null;
  }

  const source = await fs.readFile(filePath, 'utf8');
  const { data } = matter(source);
  const frontmatter = data as ApiFrontmatter;
  const response = extractResponseExample(frontmatter.api);

  return {
    description: frontmatter.description ?? frontmatter.api?.description ?? '',
    method: frontmatter.api?.method?.toUpperCase() ?? 'GET',
    parameters: frontmatter.api?.parameters ?? [],
    path: frontmatter.api?.path ?? '/',
    responseExample: response?.example ?? null,
    responseStatus: response?.status ?? '200',
    serverUrl: frontmatter.api?.servers?.[0]?.url ?? '/api',
    slug,
    sourcePath: path.relative(process.cwd(), filePath).replaceAll(path.sep, '/'),
    tags: frontmatter.api?.tags ?? [],
    title: frontmatter.title ?? normalizeTitle(filePath),
  } satisfies ApiDoc;
});

export const getApiOverview = cache(async () => {
  const apiRoot = path.join(DOCS_ROOT, 'api');
  const filePath = await findFirstExistingFile([
    path.join(apiRoot, 'ossinsight-public-api.info.mdx'),
    path.join(apiRoot, 'ossinsight-public-api.info.md'),
  ]);

  if (!filePath) {
    return null;
  }

  const source = await fs.readFile(filePath, 'utf8');
  const { data } = matter(source);
  const frontmatter = data as ApiFrontmatter;

  return {
    description: frontmatter.description ?? frontmatter.api?.info?.description ?? '',
    sourcePath: path.relative(process.cwd(), filePath).replaceAll(path.sep, '/'),
    title: frontmatter.title ?? 'OSSInsight Public API',
  } satisfies ApiOverview;
});
