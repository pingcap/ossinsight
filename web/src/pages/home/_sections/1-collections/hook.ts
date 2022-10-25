import { AsyncData, RemoteData, useRemoteData } from "../../../../components/RemoteCharts/hook";
import { useMemo } from "react";

type RawRecentHotCollectionData = {
  id: number
  name: string
  repos: number
  visits: number

  repo_id: number
  repo_name: string
  last_2nd_month_rank: number
  last_month_rank: number
  rank: number
  rank_changes: number
}

export type RecentHotCollectionData = Pick<RawRecentHotCollectionData, 'id' | 'name' | 'repos' | 'visits'> & {
  collectionRepos: Pick<RawRecentHotCollectionData, 'repo_id' | 'repo_name' | 'last_2nd_month_rank' | 'last_month_rank' | 'rank' | 'rank_changes'>[]
}

export function useRecentHotCollections(): AsyncData<RemoteData<any, RecentHotCollectionData>> {
  const { data, loading, error } = useRemoteData<any, RawRecentHotCollectionData>('recent-hot-collections', {}, false);

  const processedData: RemoteData<any, RecentHotCollectionData>= useMemo(() => {
    if (!data) {
      return undefined
    }
    const collections: RecentHotCollectionData[] = []
    for (const item of data.data) {
      if (item.id === collections[collections.length - 1]?.id) {
        collections[collections.length - 1].collectionRepos.push({
          repo_id: item.repo_id,
          repo_name: item.repo_name,
          last_2nd_month_rank: item.last_2nd_month_rank,
          last_month_rank: item.last_month_rank,
          rank: item.rank,
          rank_changes: item.rank_changes
        })
      } else {
        collections.push({
          id: item.id,
          name: item.name,
          repos: item.repos,
          visits: item.visits,
          collectionRepos: [{
            repo_id: item.repo_id,
            repo_name: item.repo_name,
            last_2nd_month_rank: item.last_2nd_month_rank,
            last_month_rank: item.last_month_rank,
            rank: item.rank,
            rank_changes: item.rank_changes
          }],
        })
      }
    }

    return {
      ...data,
      fields: data.fields as any,
      data: collections,
    }
  }, [data])

  return {
    data: processedData,
    loading,
    error,
  }
}
