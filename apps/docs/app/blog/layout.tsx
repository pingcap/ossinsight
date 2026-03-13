import type { ReactNode } from 'react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export default function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <HomeLayout
      nav={{
        enabled: false,
      }}
      themeSwitch={{
        enabled: false,
      }}
    >
      <div className="docs-shell blog-shell">{children}</div>
    </HomeLayout>
  );
}
