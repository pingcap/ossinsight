import { RemoteSelector, RemoteSelectorProps } from '../RemoteSelector';
import { RemoteSelectItem, RemoteSelectorListItemProps } from '../RemoteSelector';
import { RemoteSelectedItem, RemoteSelectedItemCommonProps } from '../RemoteSelector';
import { getCollectionText, isCollectionEquals, searchCollections } from './utils';

export type CollectionInfo = {
  id: number;
  name: string;
};

export interface CollectionSelectorProps extends Pick<RemoteSelectorProps<any>, 'id' | 'renderInput'> {
  collection: CollectionInfo | undefined;
  onCollectionSelected: (collection: CollectionInfo | undefined) => void;
}

export function CollectionSelector({ collection, onCollectionSelected, ...props }: CollectionSelectorProps) {
  return (
    <RemoteSelector<CollectionInfo>
      {...props}
      getItemText={getCollectionText}
      value={collection ? [collection] : []}
      onSelect={onCollectionSelected}
      getRemoteOptions={searchCollections}
      executeOnMount
      renderSelectedItems={([item]) => (
        <CollectionItem id={props.id} item={item} onClear={() => onCollectionSelected(undefined)} />
      )}
      renderListItem={itemProps => <CollectionListItem key={itemProps.item.id} {...itemProps} />}
      equals={isCollectionEquals}
    />
  );
}

function CollectionItem({ item, ...props }: RemoteSelectedItemCommonProps & { item: CollectionInfo }) {
  return (
    <RemoteSelectedItem {...props}>
      <span className="overflow-hidden whitespace-nowrap text-ellipsis">
        {item.name}
      </span>
    </RemoteSelectedItem>
  );
}

function CollectionListItem({ item, ...props }: RemoteSelectorListItemProps<CollectionInfo>) {
  return (
    <RemoteSelectItem {...props}>
      <span className="overflow-hidden whitespace-nowrap text-ellipsis">
        {item.name}
      </span>
    </RemoteSelectItem>
  );
}
