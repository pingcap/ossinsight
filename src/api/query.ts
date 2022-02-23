import useSWR, {SWRResponse} from "swr";

const BASE = 'https://community-preview-contributor.tidb.io/q'

interface RepoRank {
  repo_name: string,
  events: number
}

export const useRank = (n: number = 500): SWRResponse<RepoRank[]> => {
  const dataUrl = `${BASE}/recent-events-rank`

  return useSWR<RepoRank[]>([n], {
    fetcher: async n => {
      const {data} = await fetch(`${dataUrl}?n=${n}`).then(data => data.json())
      if (data.length > 0) {
        return data
      } else {
        const {data} = await fetch(`${dataUrl}?n=${n}&offset=1`).then(data => data.json())
        return data
      }
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}