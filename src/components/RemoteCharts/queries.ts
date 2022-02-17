import {BaseQueryResult} from "./hook";

type CommonRankParams = {
  n: number
  repo: string
}

interface CommonRankData {
  repo_name
}

interface RepoEventsRankData extends CommonRankData {
  events_count: string
}

interface ContributorsRankData extends CommonRankData {
  contributors_count: number
}

type RepoEventsRankQuery<T> = BaseQueryResult<CommonRankParams & T, RepoEventsRankData>
type ContributorsRankQuery<T> = BaseQueryResult<CommonRankParams & T, ContributorsRankData>

export interface Queries extends Record<string, BaseQueryResult<any, any>> {
  'events-history': RepoEventsRankQuery<{
    event: string
    years: number
  }>
  'events-per-year': RepoEventsRankQuery<{
    event: string
    year: number
  }>
  'contributors-history': ContributorsRankQuery<{
    action: string
    merged: string
    years: number
  }>
  'contributors-per-year': ContributorsRankQuery<{
    action: string
    merged: string
    year: number
  }>
}
