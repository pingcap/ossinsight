import { useMemo } from 'react';
import { SiteWidgetsTagsConfig } from '../../types/ui-config';

export function useCategories (config: SiteWidgetsTagsConfig['filters'], tags: string[], defaultCategoryName = 'Others') {
  return useMemo(() => {
    const others = new Set<string>(tags);
    const categories = [{
      key: 'all',
      name: 'All',
      tags: [...config].sort(),
    }];
    config.forEach((tag: string) => others.delete(tag));

    if (others.size > 0) {
      categories.push({
        key: '__DEFAULT__',
        name: defaultCategoryName,
        tags: Array.from(others).sort(),
      });
    }
    return categories;
  }, [config, tags, defaultCategoryName]);
}
