import { usePluginData } from '@docusaurus/useGlobalData';
import { paramCase } from 'param-case';
import { useMemo } from 'react';
import useSWR from 'swr';
import { core } from '../../../api';
import { RemoteData } from '../../../components/RemoteCharts/hook';
import { Collection } from '@ossinsight/api'

export function useCollections(): Collection[] {
  const {collections} = usePluginData<{collections: RemoteData<any, Collection>}>('plugin-prefetch');

  const { data } = useSWR<RemoteData<any, Collection>>('static/collections', {
    fetcher: core.getCollections,
    fallbackData: collections,
  });

  return useMemo(() => {
    return data?.data.map(collection => ({
      ...collection,
      slug: paramCase(collection.name),
    })) ?? [];
  }, [data]);
}

export function useCollection(slug: string): Collection | undefined {
  const collections = useCollections();

  return useMemo(() => {
    return collections.find(c => c.slug === slug);
  }, [collections, slug]);
}