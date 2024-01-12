import { BaseQueryResult } from './hook';

type CommonRankParams = {
  n: number;
  repo: string;
};

interface CommonRankData {
  repo_name;
}

interface RepoEventsRankData extends CommonRankData {
  events_count: string;
}

interface ContributorsRankData extends CommonRankData {
  contributors_count: number;
}

type RepoEventsRankQuery<T> = BaseQueryResult<CommonRankParams & T, RepoEventsRankData>;
type ContributorsRankQuery<T> = BaseQueryResult<CommonRankParams & T, ContributorsRankData>;

export interface Queries extends Record<string, BaseQueryResult<any, any>> {
  'events-history': RepoEventsRankQuery<{
    event: string;
    years: number;
  }>;
  'events-per-year': RepoEventsRankQuery<{
    event: string;
    year: number;
  }>;
  'contributors-history': ContributorsRankQuery<{
    action: string;
    merged: string;
    years: number;
  }>;
  'contributors-per-year': ContributorsRankQuery<{
    action: string;
    merged: string;
    year: number;
  }>;
  'rt-top10-by-stars': BaseQueryResult<{ repo: string }, { repo_name: string, num: number }>;
  'rt-top10-by-prs': BaseQueryResult<{ repo: string }, { repo_name: string, num: number }>;
  'rt-top20-by-developers': BaseQueryResult<{ repo: string }, { repo_name: string, num: number }>;
  'rt-top20-by-companies': BaseQueryResult<{ repo: string }, { company: string, num: number }>;
  'archive/2021/language-ranking-by-prs': BaseQueryResult<{ field: string }, { language: string, prs: number }>;
  'archive/2021/repo-contributor-ranking-by-prs': BaseQueryResult<{}, { repo_name: string, contributor: string, prs: number }>;
  'events-total': BaseQueryResult<{}, { cnt: number }>;
  'events-last-imported': BaseQueryResult<{}, { type: string, cnt: number }>;
}
