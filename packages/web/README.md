# @ossinsight/web

**Next.js 15 frontend for OSSInsight** — replaces the Docusaurus-based `web/` directory.

## Stack

| Area           | Choice                            |
|----------------|-----------------------------------|
| Framework      | Next.js 15 (App Router)           |
| Language       | TypeScript                        |
| Styling        | Tailwind CSS 3 + CSS variables    |
| UI Components  | shadcn/ui (Radix UI primitives)   |
| Testing        | Vitest + Testing Library (jsdom)  |
| Database       | `@ossinsight/db` (Prisma 7)       |

## Development

```bash
# Set environment variable
export DATABASE_URL="mysql://user:pass@host:4000/ossinsight"

# Install (from repo root)
pnpm install

# Start dev server
cd packages/web
pnpm dev

# Run tests
pnpm test
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & layouts
│   ├── layout.tsx        # Root layout (Tailwind globals, metadata)
│   ├── page.tsx          # Home page
│   └── globals.css       # CSS custom properties + Tailwind directives
├── components/
│   └── ui/               # shadcn/ui component primitives
│       ├── button.tsx
│       └── …
├── lib/
│   └── utils.ts          # cn() helper (clsx + tailwind-merge)
└── test/
    └── setup.ts          # Vitest / Testing Library setup
```

## Adding shadcn Components

Components in `src/components/ui/` follow the shadcn/ui pattern — they are plain React
components using Radix UI primitives and Tailwind classes.  To add more components,
copy the source from https://ui.shadcn.com/docs/components and place them in
`src/components/ui/`.
