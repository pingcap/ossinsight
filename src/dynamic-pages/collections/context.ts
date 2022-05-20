import { createContext } from 'react';
import { Collection } from './hooks/useCollection';

export interface CollectionsContextValues {
  collection?: Collection;
}

const CollectionsContext = createContext<CollectionsContextValues>({
  collection: undefined,
});

export default CollectionsContext;
