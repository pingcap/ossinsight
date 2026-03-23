'use client';

import { LinkedDataContext } from '@/components/Context/LinkedData';
import { LinkedData } from '@/lib/charts-core/parameters/resolver';
import { ReactNode } from 'react';

const globalLinkedData: LinkedData = {
  users: {},
  orgs: {},
  collections: {},
  repos: {},
};

export default function CompareLayout({ children }: { children: ReactNode }) {
  return (
    <LinkedDataContext.Provider value={globalLinkedData}>
      {children}
    </LinkedDataContext.Provider>
  );
}
