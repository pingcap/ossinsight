import { useRealtimeRemoteData, useRealtimeRemoteDataWs } from '../RemoteCharts/hook';

export function useRealtimeEvents(run: boolean) {
  // const { data } = useRealtimeRemoteData<{}, { cnt: number, latest_timestamp: string }>('events-increment-intervals', {}, false, run);
  const { data } = useRealtimeRemoteDataWs<{}, { cnt: number, latest_timestamp: string }>('events-increment-intervals', {}, false, run)

  return data?.data ?? []
}
