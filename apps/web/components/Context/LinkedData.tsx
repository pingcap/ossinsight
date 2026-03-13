'use client';

import { LinkedData } from '@/lib/charts-core/parameters/resolver';
import { createContext } from 'react';

export const LinkedDataContext = createContext<LinkedData>({
  repos: {},
  users: {},
  collections: {},
  orgs: {},
});

