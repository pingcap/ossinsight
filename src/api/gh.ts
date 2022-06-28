import useSWR, {SWRResponse} from 'swr'
import { getRepo } from './core';

export interface RepoInfo {
  id: number
  full_name: string
  forks: number
  open_issues: number
  subscribers_count: number
  watchers: number
  language: string
  owner: {
    avatar_url: string
    html_url: string
    login: string
  }
}

export const useRepo = (repoName): SWRResponse<RepoInfo> => {
  return useSWR<RepoInfo>(repoName ? [repoName] : undefined, {
    fetcher: getRepo,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}
