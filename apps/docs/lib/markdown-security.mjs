import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize, {defaultSchema} from 'rehype-sanitize';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const schema = {
  ...defaultSchema,
  tagNames: [...defaultSchema.tagNames, 'video', 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    video: ['src', 'poster', 'controls', 'autoPlay', 'muted', 'loop', 'playsInline', 'preload', 'width', 'height'],
    iframe: ['src', 'title', 'width', 'height'],
  },
  protocols: {...defaultSchema.protocols, poster: ['https', 'http']},
};

function walk(node, visit) {
  if (node.type === 'element') visit(node);
  for (const child of node.children || []) walk(child, visit);
}

function isVideoEmbed(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash
      && ['www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname)
      && /^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname);
  } catch { return false; }
}

function sanitizeMarkdown() {
  const sanitize = rehypeSanitize(schema);
  return tree => {
    const anchors = new Set();
    walk(tree, node => {
      for (const name of ['id', 'name']) {
        if (typeof node.properties?.[name] === 'string') anchors.add(node.properties[name]);
      }
      // Untrusted iframe URLs and srcdoc must never survive as active embeds.
      if (node.tagName === 'iframe' && !isVideoEmbed(node.properties?.src)) {
        node.tagName = 'span';
        node.properties = {};
        node.children = [];
      }
    });
    const safe = sanitize(tree);
    walk(safe, node => {
      const href = node.properties?.href;
      if (node.tagName === 'a' && typeof href === 'string' && href.startsWith('#')) {
        try {
          const target = decodeURIComponent(href.slice(1));
          if (anchors.has(target)) node.properties.href = `#${encodeURIComponent(schema.clobberPrefix + target)}`;
        } catch { /* Leave malformed fragments inert. */ }
      }
      if (node.tagName === 'iframe') {
        node.properties.sandbox = 'allow-scripts allow-same-origin allow-presentation';
        node.properties.allow = 'autoplay; encrypted-media; picture-in-picture';
        node.properties.allowFullScreen = true;
        node.properties.referrerPolicy = 'strict-origin-when-cross-origin';
        node.properties.loading = 'lazy';
      }
    });
    return safe;
  };
}

// Sanitize raw HTML and generated heading IDs before trusted presentation plugins.
/** @type {NonNullable<import('react-markdown').Options['rehypePlugins']>} */
export const markdownRehypePlugins = [
  rehypeRaw,
  rehypeSlug,
  sanitizeMarkdown,
  [rehypePrettyCode, {
    theme: 'one-dark-pro', keepBackground: false, bypassInlineCode: true,
    defaultLang: {block: 'plaintext', inline: 'plaintext'},
    onVisitLine(node) {
      if (node.children.length === 0) node.children = [{type: 'text', value: ' '}];
    },
  }],
  [rehypeAutolinkHeadings, {
    behavior: 'append', properties: {ariaLabel: 'Permalink', className: ['anchor-link']},
  }],
];

export function toPublicAssetPath(assetPath, assetBasePath) {
  if (assetPath.startsWith('./')) {
    return `${assetBasePath}/${assetPath.slice(2)}`;
  }

  if (assetPath.startsWith('@site/blog/')) {
    return `/blog-assets/${assetPath.slice('@site/blog/'.length)}`;
  }

  return assetPath;
}

function quoteMarkdownBlock(text) {
  return text
    .trim()
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n');
}

function normalizeAdmonitions(source) {
  return source.replace(/^:::(\w+)\s*\n([\s\S]*?)^:::\s*$/gm, (_match, rawType, body) => {
    const type = rawType.toLowerCase();
    const labelMap = {
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

export function normalizeMarkdownSource(source, assetBasePath) {
  let nextSource = source.replace(/<!--truncate-->/g, '');
  nextSource = normalizeAdmonitions(nextSource);

  if (!assetBasePath) {
    return nextSource;
  }

  nextSource = nextSource.replace(/src=\{require\((['"])(\.\/[^'"]+|@site\/blog\/[^'"]+)\1\)\.default\}/g, (_match, _quote, assetPath) => {
    return `src="${toPublicAssetPath(assetPath, assetBasePath)}"`;
  });

  nextSource = nextSource.replace(/!\[([^\]]*)\]\(\.\/([^)]+)\)/g, (_match, altText, assetPath) => {
    return `![${altText}](${toPublicAssetPath(`./${assetPath}`, assetBasePath)})`;
  });

  nextSource = nextSource.replace(/<img([^>]*?)src=["']\.\/([^"']+)["']([^>]*)>/g, (_match, before, assetPath, after) => {
    return `<img${before}src="${toPublicAssetPath(`./${assetPath}`, assetBasePath)}"${after}>`;
  });

  return nextSource;
}

