import { createContext } from 'react';
import type { Collection } from '@ossinsight/api';

export interface CollectionsContextValues {
  collection?: Collection;
}

const CollectionsContext = createContext<CollectionsContextValues>({
  collection: undefined,
});

export default CollectionsContext;
