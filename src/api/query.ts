import useSWR, {SWRResponse} from "swr";
import {BASE_URL} from "../lib/request";

export interface RepoRank {
  repo_name: string,
  history_events: number
  commit_comment_events: number
  issue_comment_events: number
  issues_events: number
  pull_request_events: number
  pull_request_review_comment_events: number
  pull_request_review_events: number
  watch_events: number
}

interface RepoRankData extends Array<RepoRank> {
  sql: string
}

export const useRank = (period = 'last_hour'): SWRResponse<RepoRankData> => {
  const dataUrl = `${BASE_URL}/q/recent-events-rank`

  return useSWR<RepoRankData>([period], {
    fetcher: async (period) => {
      const {data, sql} = await fetch(`${dataUrl}?period=${period}`).then(data => data.json())
      data.sql = sql
      return data
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}
