import React, { useMemo } from 'react';
import { RecentHotCollectionData, useRecentHotCollections } from '../../home/_sections/1-collections/hook';
import HotCollection, { LoadingHotCollection } from '../../../components/HotCollection';
import { SortType } from './filters';
import { Grid } from '@mui/material';

interface CollectionsProps {
  sorter: SortType;
  search: string;
}

export default function Collections ({ sorter, search }: CollectionsProps) {
  const { data, loading } = useRecentHotCollections();

  const processedData = useMemo(() => {
    let sortFn: (a: RecentHotCollectionData, b: RecentHotCollectionData) => number;
    let filterFn: (n: RecentHotCollectionData) => boolean;

    switch (sorter) {
      case SortType.alphabetical:
        sortFn = (a, b) => a.name > b.name ? 1 : a.name === b.name ? 0 : -1;
        break;
      case SortType.recent:
        sortFn = (a, b) => a.id < b.id ? 1 : a.id === b.id ? 0 : -1;
        break;
    }

    if (search) {
      filterFn = n => n.name.toLowerCase().includes(search.toLowerCase());
    } else {
      filterFn = () => true;
    }

    return data?.data.filter(filterFn).sort(sortFn) ?? [];
  }, [data, sorter, search]);

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[0, 1, 2, 3, 4].map(i => (
          <Grid key={i} item {...sizes}>
            <LoadingHotCollection />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {processedData.map(({ id, name, repos, collectionRepos }) => (
        <Grid key={id} item {...sizes}>
          <HotCollection name={name} repos={repos} collectionRepos={collectionRepos} />
        </Grid>
      ))}
    </Grid>
  );
}

const sizes = {
  sm: 12,
  md: 6,
  lg: 4,
  xl: 3,
} as const;
