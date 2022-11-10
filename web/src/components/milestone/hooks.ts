import { useRemoteData } from '@site/src/components/RemoteCharts/hook';
import type { Milestone } from '@ossinsight/api';
import { notNullish } from '@site/src/utils/value';

export function useMilestones (repoId: number | undefined) {
  return useRemoteData<any, Milestone>('analyze-repo-milestones', { repoId }, false, notNullish(repoId));
}
