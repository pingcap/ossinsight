import useSWR, {SWRResponse} from 'swr'

const dataUrl = 'https://community-preview-contributor.tidb.io/gh'

interface RepoInfo {
  id: number
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
  return useSWR<RepoInfo>([repoName], {
    fetcher: async repoName => {
      const {data} = await fetch(`${dataUrl}/repo/${repoName}`).then(res => res.json())
      return data
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}
