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

export type CollectionMonthRankData = {
  current_month: string
  last_month: string
  repo_name: string
  current_month_total: number
  last_month_total: number
  total_mom: number
  current_month_rank: number
  last_month_rank: number
  rank_mom: number
  total: number
}


export function useCollectionHistory(collectionId: number | undefined, dimension: string) {
  return useRemoteData<any, CollectionHistoryData>(`collection-${dimension}-history`, { collectionId }, false, collectionId !== undefined);
}

export function useCollectionHistoryRank(collectionId: number | undefined, dimension: string) {
  return useRemoteData<any, CollectionHistoryRankData>(`collection-${dimension}-history-rank`, { collectionId }, false, collectionId !== undefined);
}

export function useCollectionMonthRank(collectionId: number | undefined, dimension: string) {
  return useRemoteData<any, CollectionMonthRankData>(`collection-${dimension}-month-rank`, { collectionId }, false, collectionId !== undefined);
}
