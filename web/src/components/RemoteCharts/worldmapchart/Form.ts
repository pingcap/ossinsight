import { Queries } from '../queries';
import { useMemo } from 'react';

export type Query<Q extends keyof Queries> = Queries[Q]['params'] & {
  category: Q;
  valueIndex: keyof Queries[Q]['data'];
  categoryIndex: keyof Queries[Q]['data'];
};

export function useForm () {
  return useMemo(() => ({
    form: null,
    query: {},
  }), []);
}
