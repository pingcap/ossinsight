import { PropSidebar } from '@docusaurus/plugin-content-docs';
import { useCollections } from './useCollection';

export function useCollectionsSidebar(): PropSidebar {
  const collections = useCollections();

  return collections.map(collection => ({
    type: 'link',
    href: `/collections/${collection.slug}`,
    label: collection.name,
  }));
}
