'use client';

import siteConfig from '@/site.config';
import { WidgetsFilter, WidgetsFilterConfig } from '@/lib/ui/components/WidgetsFilter';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function Filter ({ config }: { config: WidgetsFilterConfig }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handle = (config: WidgetsFilterConfig) => {
    const usp = new URLSearchParams(searchParams as any);
    if (config.tag) {
      usp.set('tag', config.tag);
    } else {
      usp.delete('tag');
    }
    if (config.search) {
      usp.set('q', config.search);
    } else {
      usp.delete('q');
    }

    router.push(pathname + '?' + usp.toString(), {
      scroll: false,
    });
  };

  return (
    <WidgetsFilter
      availableTags={siteConfig.widgets.tags.filters}
      config={config}
      onConfigChange={handle}
    />
  );
}