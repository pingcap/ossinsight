# Notes

## Current audit

- Main web routes currently smoke-test clean locally: `/`, `/explore`, `/collections`, `/analyze/pingcap/ossinsight`, `/analyze/pingcap`, `/collections/api`, `/gh/repo/pingcap/ossinsight`, and `/api/q/events-total` all return `200`.
- Multi-repo compare mode still has a real runtime chart error. `http://127.0.0.1:3001/analyze/pingcap/ossinsight?vs=vercel/next.js` returns `200`, but the browser console still reports `Error: yAxis "vs" not found`, which means at least one compare chart is still misconfigured.
- Org analyze still has confirmed broken data dependencies. `http://127.0.0.1:3001/analyze/pingcap` returns `200`, but `/api/q/orgs/repos/active/ranking` and `/api/q/orgs/repos/active/total` both return `404`, and the page console still reports `TypeError: object is not iterable` from `apps/web/components/ui/components/GHRepoSelector/utils.ts` / `GHOrgRepoSelector.tsx`.
- `docs` and `API` pages had several `fumadocs` card surfaces that did not match the flatter content structure of `ossinsight.io`. These were reduced in the current pass, but the shared docs header and some generated widgets still need more source-level alignment.
- The docs app still depends on `fumadocs` interaction patterns for sidebar, tabs, and page chrome. That keeps behavior stable, but it is not a perfect structural match for the original Docusaurus-based site.
- Some migrated blog posts still degrade legacy interactive content to archive placeholders instead of restoring the original embedded experience. This is visible in `apps/docs/src/components/CommonChart.tsx` and `apps/docs/src/components/ContributorsCharts.tsx`.
- `Data Explorer` is visually much closer to the original homepage and result layout, but the backend still uses the newer one-turn flow. The original site exposed a more staged lifecycle while SQL was being generated.
- The current `Data Explorer` page still emits image warnings in dev for legacy preview assets. That is not user-visible breakage, but it is a cleanup item.
- The `Data Explorer` duplicate-key warning in the popular-question list has been fixed in the current pass, so it is no longer an outstanding runtime issue.
- The homepage hero currently renders `SELECT insights FROM 0 GitHub events` on first load in local runtime, even though the old site treated that total as a core live credibility signal. The data-refresh logic exists in `apps/web/app/home-content.tsx`, but the rendered value still does not reliably match the legacy experience.
- The docs/API header is still a custom Next implementation, not a direct structural port of the old site header. It now matches the site colors, but spacing, dropdown behavior, and active-state treatment still differ from the original implementation.
- The docs/API experience still shows two layers of chrome on API pages: the shared site header plus the internal `fumadocs` banner/search/sidebar shell. That is functional, but structurally further from the original OSS Insight site than a single integrated header would be.
- Blog article pages now have top-and-bottom share buttons again, matching the old site behavior more closely, but blog list/detail pages still do not fully recreate the old Docusaurus footer/paginator structure.
- API detail pages are functional, but they still lean heavily on `fumadocs` primitives such as `DynamicCodeBlock`, `Tabs`, `TypeTable`, and `DocsPage`. That keeps them usable, but the result is still visually more framework-shaped than the original OSS Insight API/docs pages.
- `next build` for `apps/web` still finishes with the long-standing `/collections` dynamic-usage notice around `searchParams`. It is not a user-facing outage, but it remains an architectural mismatch with a fully static-friendly setup.
- Homepage, Explore, collection detail, and collection trends pages currently run without browser-console errors in the sampled local pass. The remaining confirmed runtime breakages are concentrated in compare analyze, org analyze, and some migrated docs/blog embeds rather than the whole site shell.

## Old-site issues not worth copying 1:1

- The original docs/blog stack inherited a lot of default Docusaurus chrome. It was functional, but some screens felt more like framework defaults than OSS Insight-specific design.
- The old API docs leaned on generated documentation widgets heavily. They exposed the data well, but the visual density and method-color palette were not always consistent with the rest of the site.
- Several old blog/doc pages mixed content with embedded legacy widgets in ways that created uneven spacing and inconsistent visual weight.
- The old sidebar collapse affordance was easy to miss once layered under a custom site header. That behavior is not something to preserve.
- The original `Data Explorer` loading lifecycle had more visible intermediate steps, but it also made the interaction model more complex and brittle. Preserving the visual rhythm is useful; preserving the full old control flow is not automatically a quality win.
- The original blog/article chrome relied on framework-provided pagination and footer conventions that were familiar, but not especially distinctive. Reintroducing the useful navigation affordances makes sense; copying every piece of Docusaurus chrome does not.
- Some old embedded chart blocks inside blog posts were tightly coupled to legacy widget bundles and page runtime assumptions. Recreating the insight is useful; preserving those brittle embedding mechanics exactly is not.

## Follow-up replication targets

- Fix org analyze first: restore `/api/q/orgs/repos/active/ranking` and `/api/q/orgs/repos/active/total`, then resolve the `GHOrgRepoSelector` iterable error so the org page is functionally complete again.
- Fix the compare-page `yAxis "vs" not found` ECharts error before doing more cosmetic compare-page polish.
- Restore the homepage total-events hero count so it no longer idles at `0` during normal local runtime.
- Continue flattening docs/API detail screens so the page body reads like content first and framework shell second.
- Collapse the docs/API double-header setup into a single integrated chrome layer if the goal is closer source-level parity with `ossinsight.io`.
- Audit the shared docs header against the main web header at the spacing and hover-state level.
- Inspect generated tables, tabs, and API examples to decide which third-party styles should be overridden for closer OSS Insight parity.
- Decide whether the archived blog chart placeholders should be rebuilt with lightweight static chart renders or remain as explicit migration gaps.
- Review `Data Explorer` result-state details against the legacy execution flow, especially loading copy, share affordances, and SQL/result spacing.
- Audit analyze pages section-by-section against `ossinsight-next` for remaining spacing and typography drift after the major layout work.
