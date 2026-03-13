import type { ReactNode } from 'react';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { getDocsNav, getLayoutLinks, githubUrl } from '@/lib/layout-options';
import { pageTree } from '@/lib/source';

export default function DocsSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DocsLayout
      tree={pageTree}
      githubUrl={githubUrl}
      links={getLayoutLinks()}
      nav={getDocsNav()}
      searchToggle={{
        enabled: true,
      }}
      themeSwitch={{
        enabled: false,
      }}
      sidebar={{
        defaultOpenLevel: 1,
      }}
    >
      {children}
    </DocsLayout>
  );
}
