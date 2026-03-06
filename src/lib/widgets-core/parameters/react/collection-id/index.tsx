import { RemoteSelectorInputProps } from '@/lib/ui';
import { CollectionInfo, CollectionSelector } from '@/lib/ui/components/CollectionSelector';
import { useCallback, useContext } from 'react';
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
  return <input className="TextInput" {...props}
                type={(props as any).type === 'button' ? undefined : (props as any).type} />;
}