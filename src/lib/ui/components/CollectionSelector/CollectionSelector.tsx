

import { makeNoopCancellablePromise } from '../../utils/promise';
import { RemoteSelectItem, RemoteSelector, RemoteSelectorProps } from '../RemoteSelector';
import { collectionsPromise, getCollectionText, isCollectionEquals } from './utils';

export type CollectionInfo = {
  id: number
  name: string
  public: boolean
}

export interface CollectionSelectorProps extends Pick<RemoteSelectorProps<any>, 'id' | 'renderInput'> {
  collection: CollectionInfo | undefined;
  onCollectionSelected: (collection: CollectionInfo) => void;
}

export function CollectionSelector ({ collection, onCollectionSelected, ...props }: CollectionSelectorProps) {
  return (
    <RemoteSelector<CollectionInfo>
      {...props}
      executeOnMount
      getItemText={getCollectionText}
      value={collection ? [collection] : []}
      onSelect={onCollectionSelected}
      getRemoteOptions={searchCollection}
      renderListItem={({ item, ...props }) => <RemoteSelectItem key={item.id} {...props} >{item.name}</RemoteSelectItem>}
      equals={isCollectionEquals}
    />
  );
}

export function searchCollection (name: string) {
  return makeNoopCancellablePromise(collectionsPromise.then(collections => collections.filter(c => name ? c.name.toLowerCase().includes(name.toLowerCase()) : true)));
}
