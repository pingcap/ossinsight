import { useRemoteData } from '../../../components/RemoteCharts/hook';


export type CollectionHistoryData = {
  repo_name: string
  event_month: string
  total: number
}

export type CollectionHistoryRankData = {
  repo_name: string
  event_year: number
  total: number
  rank: number
}


export function useCollectionHistory(collectionId: number, dimension: string) {
  return useRemoteData<any, CollectionHistoryData>(`collection-${dimension}-history`, { collectionId }, false);
}

export function useCollectionHistoryRank(collectionId: number, dimension: string) {
  return useRemoteData<any, CollectionHistoryRankData>(`collection-${dimension}-history-rank`, { collectionId }, false);
}