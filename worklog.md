## Phase 0 – Context Verification
- Confirmed GitHub issue [#1879](https://github.com/pingcap/ossinsight/issues/1879) describes stripping `https://github.com/` when pasting into the repo search box.
- Located the affected UI in `web/src/components/GeneralSearch/index.tsx`, which renders the global repo/user/org search input with a controlled `keyword` state and currently lacks any paste handling.

## Phase 1 – Analysis & Design
### Observations
- The search input is a Material UI `TextField` rendered inside an `Autocomplete`, so manual `onPaste` handling must live inside the `renderInput` callback and update the controlled `keyword` state via `setKeyword`.
- All normalization logic should be pure/isolated so it can be unit-tested without rendering the whole component.

### Proposed Solution
1. Introduce a small utility (e.g., `normalizeGithubRepoPaste`) that:
   - Detects `http://` or `https://` GitHub URLs (with or without `www.`), strips the origin, trims whitespace/trailing slashes, and returns up to the first two path segments (`owner` and `repo`).
   - Leaves non-GitHub strings and partial inputs untouched.
2. Wire an `onPaste` handler onto the search input. It will read `clipboardData`, call the utility, and when the normalized value differs, `preventDefault()` and `setKeyword(cleanValue)` so the field immediately shows `owner/repo`.
3. Keep the implementation tiny (KISS) and avoid touching unrelated behaviors so normal typing and pasting non-URLs remain unchanged.

### Test Strategy
- Add `vitest` in the `web` package and create unit tests for the normalization utility to exercise:
  - `https://`/`http://` schemes, optional `www.`, trailing slashes, query/hash fragments, and deeper paths (should truncate at owner/repo).
  - Non-GitHub inputs that must remain unchanged.
- Execute the new tests via `npm run test` inside `web`.

## Phase 2 – Implementation & Verification
- Added `vitest` to the `web` package plus a focused suite in `src/components/GeneralSearch/normalizeGithubRepoPaste.test.ts` that encodes the acceptance scenarios (schemes, trailing slash, extra segments, `.git`, bare host, untouched non-GitHub inputs).
- Implemented `normalizeGithubRepoPaste` and a lightweight `onPaste` handler in `GeneralSearch` so GitHub URLs are stripped before updating the controlled keyword, while other paste operations behave as before.
- Tests: `npm run test` (from `web/`) – passes 10 unit tests validating the normalization logic leveraged by the paste handler.
