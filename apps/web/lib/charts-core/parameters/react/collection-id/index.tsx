import { RemoteSelectorInputProps } from '@/components/ui';
import { CollectionInfo, CollectionSelector } from '@/components/ui/components/CollectionSelector';
import { useCallback, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { ParametersContext } from '../context';

export function CollectionIdInput ({ id, value, onValueChange }: { id: string, value: number, onValueChange: (newValue: number | undefined) => void }) {
  const { linkedData } = useContext(ParametersContext);

  const handleCollectionChange = useCallback((collection: CollectionInfo | undefined) => {
    if (collection) {
      linkedData.collections[String(collection.id)] = collection;
    }
    onValueChange(collection?.id);
  }, []);

  const collection = linkedData.collections[String(value)];

  return (
    <CollectionSelector
      id={id}
      collection={collection}
      onCollectionSelected={handleCollectionChange}
      renderInput={renderInput}
    />
  );
}

function renderInput (props: RemoteSelectorInputProps) {
  return <Input className="min-w-[12rem] border-border bg-input" {...props} />;
}
