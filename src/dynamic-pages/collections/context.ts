import { createContext } from 'react';
import { Collection } from './hooks/useCollection';

export interface CollectionsContextValues {
  collection: Collection;
}

const CollectionsContext = createContext<CollectionsContextValues>({
  collection: {
    id: 0,
    name: 'Unknown',
    slug: 'unknown',
  },
});

export default CollectionsContext;
