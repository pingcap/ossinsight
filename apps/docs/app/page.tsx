import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { BookOpenText, FileCode2, Newspaper } from 'lucide-react';

const sections = [
  {
    title: 'Blog',
    description: 'Product stories, engineering write-ups, and yearly insight reports migrated from the legacy OSS Insight site.',
    href: '/blog',
    icon: Newspaper,
  },
  {
    title: 'Guides',
    description: 'About pages, FAQ, and supporting documentation in the same visual system as the main app.',
    href: '/docs/about',
    icon: BookOpenText,
  },
  {
    title: 'Public API',
    description: 'The beta API reference, reshaped for Next.js without the old Docusaurus runtime dependency chain.',
    href: '/docs/api',
    icon: FileCode2,
  },
];

export default function DocsHomePage() {
  return (
    <HomeLayout
      nav={{
        enabled: false,
      }}
      themeSwitch={{
        enabled: false,
      }}
    >
      <div className="docs-shell">
        <section className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#ffe895]">OSS Insight Docs</div>
          <h1 className="mt-4 text-[32px] font-semibold tracking-tight text-white sm:text-[40px]">
            Blog, guides, and API docs in the same site language
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-400 sm:text-base">
            This app hosts the editorial side of OSS Insight while keeping navigation and color aligned with the main
            analytics application.
          </p>
        </section>

        <section className="mx-auto mt-12 max-w-4xl border-t border-white/8">
          <ul className="divide-y divide-white/8">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <li key={section.href}>
                  <a
                    href={section.href}
                    className="group flex items-start gap-4 py-6 text-left transition-colors hover:text-[#fff2bd]"
                  >
                    <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-[#ffe895]">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[17px] font-semibold text-white transition-colors group-hover:text-[#fff2bd]">
                        {section.title}
                        <span className="text-[#7c7c7c] transition-colors group-hover:text-[#ffe895]">›</span>
                      </span>
                      <span className="mt-2 block text-sm leading-7 text-[#a7a7ad]">
                        {section.description}
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </HomeLayout>
  );
}
