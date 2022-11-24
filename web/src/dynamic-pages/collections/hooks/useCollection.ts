import { usePluginData } from '@docusaurus/useGlobalData';
import { paramCase } from 'param-case';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { core } from '../../../api';
import { RemoteData } from '../../../components/RemoteCharts/hook';
import { Collection } from '@ossinsight/api';
import deepEqual from 'fast-deep-equal';

export function useCollections (): Collection[] {
  const { collections } = usePluginData('plugin-prefetch') as { collections: RemoteData<any, Collection> };

  const { data } = useSWR<RemoteData<any, Collection>>('static/collections', {
    fetcher: core.getCollections,
    fallbackData: collections,
    compare: deepEqual,
  });

  return useMemo(() => {
    return data?.data.map(collection => ({
      ...collection,
      slug: paramCase(collection.name),
    })) ?? [];
  }, [data]);
}

export function useCollection (slug: string): Collection | undefined {
  const collections = useCollections();

  return useMemo(() => {
    return collections.find(c => c.slug === slug);
  }, [collections, slug]);
}

export function useFindCollectionById () {
  const collections = useCollections();

  return useCallback((id: number) => {
    return collections.find(c => c.id === id);
  }, [collections]);
}
