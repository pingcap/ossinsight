import useSWR, { SWRResponse } from 'swr';
import { query } from './core';

export interface RepoRank {
  repo_name: string;
  history_events: number;
  commit_comment_events: number;
  issue_comment_events: number;
  issues_events: number;
  pull_request_events: number;
  pull_request_review_comment_events: number;
  pull_request_review_events: number;
  watch_events: number;
}

interface RepoRankData extends Array<RepoRank> {
  sql: string;
}

export const useRank = (period = 'last_hour'): SWRResponse<RepoRankData> => {
  return useSWR<RepoRankData>(['recent-events-rank', period], {
    fetcher: async (q, period) => {
      const data = await query<RepoRank>(q, { period });
      const res: RepoRankData = data.data as RepoRankData;
      res.sql = data.sql;
      return res;
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};
