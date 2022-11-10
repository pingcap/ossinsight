import { RemoteData, useRemoteData } from '@site/src/components/RemoteCharts/hook';
import { registerStaticData } from '@site/src/api/client';
import { query } from '@site/src/api/_todo_hardcoded';
import type { Milestone } from '@ossinsight/api';
import { notNullish } from '@site/src/utils/value';

// TODO: Remove in production
registerStaticData<Partial<RemoteData<any, Milestone>>>(query('/q/milestones', () => true), {
  data: [
    {
      id: 0,
      repo_id: 0,
      milestone_type_id: 1,
      milestone_number: 500,
      payload: null,
      reached_at: '2022-11-10T03:43:25.000+00:00',
    },
    {
      id: 1,
      repo_id: 0,
      milestone_type_id: 1,
      milestone_number: 1000,
      payload: null,
      reached_at: '2022-11-11T03:43:25.000+00:00',
    },
    {
      id: 2,
      repo_id: 0,
      milestone_type_id: 2,
      milestone_number: 1500,
      payload: null,
      reached_at: '2022-11-12T03:43:25.000+00:00',
    },
    {
      id: 3,
      repo_id: 0,
      milestone_type_id: 3,
      milestone_number: 1000,
      payload: null,
      reached_at: '2022-11-14T03:43:25.000+00:00',
    },
    {
      id: 4,
      repo_id: 0,
      milestone_type_id: 4,
      milestone_number: 1000,
      payload: null,
      reached_at: '2022-11-15T03:43:25.000+00:00',
    },
    {
      id: 5,
      repo_id: 0,
      milestone_type_id: 5,
      milestone_number: 1000,
      payload: null,
      reached_at: '2022-11-15T03:43:25.000+00:00',
    },
    {
      id: 6,
      repo_id: 0,
      milestone_type_id: 6,
      milestone_number: 1,
      payload: null,
      reached_at: '2022-11-16T03:43:25.000+00:00',
    },
  ],
});

export function useMilestones (repoId: number | undefined) {
  return useRemoteData<any, Milestone>('/q/milestones', { repoId }, false, notNullish(repoId));
}
