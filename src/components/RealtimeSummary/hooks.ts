import { useRealtimeRemoteData } from '../RemoteCharts/hook';

export function useData() {
  const { data } = useRealtimeRemoteData<{}, { cnt: number, latest_timestamp: string}>('events-increment-intervals', {}, false, true);

  return data?.data ?? []
}
