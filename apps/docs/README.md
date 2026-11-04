# Docs content files

Blog and API slugs are single path segments. Legacy docs may use nested segments.
Each segment starts with an ASCII letter or digit and contains only ASCII letters,
digits, dots, underscores or hyphens, up to 180 characters. Nested paths are limited
to 512 characters. Next decodes route parameters once; the content loader never
decodes them again.

`lib/content-files.ts` checks both lexical and real filesystem containment before
returning a regular file. Symlinks must resolve within the configured public
content root. Missing, invalid and escaped paths all return no content, allowing
the existing routes to return their normal not-found response. Markdown/MDX and
index/overview fallbacks remain supported.

From the repository root, run the filesystem regression tests with:

```sh
pnpm --filter @ossinsight/api-server test:security --runTestsByPath __tests__/security/docs-content-paths.test.ts
```

The security workflow covers the loader and published content directories. Tests
exercise actual temporary files and symlinks, and validate existing published
blog/API slugs. Vercel preview checks must also verify normal blog/API pages and
Markdown exports, since these depend on deployment file tracing.
