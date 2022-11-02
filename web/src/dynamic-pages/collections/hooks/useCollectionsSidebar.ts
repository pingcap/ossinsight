import { PropSidebar } from '@docusaurus/plugin-content-docs';
import { useMemo } from 'react';
import { useCollections } from './useCollection';

export function useCollectionsSidebar (): PropSidebar {
  const collections = useCollections();

  return useMemo(() => collections.filter(collection => collection.public !== 0).map(collection => ({
    type: 'category',
    label: collection.name,
    href: `/collections/${collection.slug}`,
    collapsed: true,
    collapsible: true,
    items: [{
      type: 'link',
      href: `/collections/${collection.slug}`,
      label: 'Ranking',
    }, {
      type: 'link',
      href: `/collections/${collection.slug}/trends/`,
      label: 'Popularity Trends',
    }],
  })), [collections]);
}
