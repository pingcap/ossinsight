import useSWR, {SWRResponse} from "swr";

const dataUrl = process.env.API_BASE + '/qo'

export interface Group {
  group_name: string
  repos: {
    group_name: string
    repo_name: string
    repo_id: number
  }[]
}

export function useGroups (type: string): SWRResponse<Group[]> {
  return useSWR([type], {
    fetcher: async type => {
      return await fetch(`${dataUrl}/repos/groups/${type}`).then(data => data.json())
    },
    revalidateOnFocus: false
  })
}