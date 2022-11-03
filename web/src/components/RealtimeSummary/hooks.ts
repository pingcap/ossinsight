import { useRealtimeRemoteData } from '../RemoteCharts/hook';

export function useRealtimeEvents (run: boolean) {
  const { data } = useRealtimeRemoteData<{}, { cnt: number, latest_timestamp: string }>('events-increment-intervals', {}, false, run, 'unique');

  return data?.data ?? [];
}
