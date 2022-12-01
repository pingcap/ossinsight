import React from 'react';
import { PencilIcon } from '@primer/octicons-react';
import Link from '@docusaurus/Link';
import { Collection } from '@ossinsight/api';

interface EditCollectionProps {
  collection: Collection;
}

const buildUrl = (collection: Collection) => `https://github.com/pingcap/ossinsight/edit/main/etl/meta/collections/${collection.id}.${collection.slug}.yml`;

export default function EditCollection ({ collection }: EditCollectionProps) {
  return (
    <Link href={buildUrl(collection)} target='_blank'>
      <PencilIcon /> Edit This Collection
    </Link>
  );
}
