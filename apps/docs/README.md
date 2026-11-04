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

## Markdown and document security

The Markdown renderer parses raw HTML, assigns heading IDs, then sanitizes the
tree with rehype-sanitize before trusted highlighting and permalink generation.
Scripts, event attributes, unsafe URLs and arbitrary embeds are removed. The
sanitizer keeps its DOM clobber protection; fragment links follow prefixed IDs,
and the client still resolves previously shared heading hashes. Local videos and
approved YouTube embed URLs remain supported with fixed iframe restrictions.
Repository MDX compiled by Fumadocs remains reviewed application code.

HTML receives a fresh CSP nonce from Proxy. Next, the theme provider and JSON-LD
use the same nonce; production disallows arbitrary inline scripts and eval.
The root layout reads request headers, so HTML now renders dynamically and is
not cached by browsers or CDNs. Static assets, feeds, search and Markdown exports
retain their existing cache behavior. These docs routes do not query TiDB.

The policy permits the owned production asset origin, local media and YouTube
frames. The web app's rewrites preserve the docs deployment's CSP. Verify
both the direct docs origin and `/blog`/`/docs` on ossinsight.io after deployment,
including theme initialization, navigation, anchors and media.

Run `pnpm --filter docs test:security` for malicious HTML fixtures and the current
blog corpus. The API security suite also tests the actual docs Proxy. Both suites run in the security workflow.
