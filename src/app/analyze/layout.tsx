'use client';

import { LinkedDataContext } from '@/components/Context/LinkedData';
import { LinkedData } from '@/lib/widgets-core/parameters/resolver';
import { ReactNode } from 'react';

const globalLinkedData: LinkedData = {
  users: {},
  orgs: {},
  collections: {},
  repos: {},
};

export default function Layout ({ children }: { children: ReactNode }) {

  return (
    <LinkedDataContext.Provider value={globalLinkedData}>
      {children}
    </LinkedDataContext.Provider>
  );
}
