import { useRemoteData } from '@site/src/components/RemoteCharts/hook';
import type { Milestone } from '@ossinsight/api';
import { notNullish } from '@site/src/utils/value';
import { useMemo } from 'react';

interface MilestoneGroup {
  year: number;
  milestones: Milestone[];
}

export function useMilestones (repoId: number | undefined) {
  return useRemoteData<any, Milestone>('analyze-repo-milestones', { repoId }, false, notNullish(repoId));
}

export function useGroupedMilestones (milestones: Milestone[]): MilestoneGroup[] {
  return useMemo(() => {
    return milestones.reduce((groups: MilestoneGroup[], milestone) => {
      const year = (new Date(milestone.reached_at)).getUTCFullYear();
      if (groups.length > 0 && groups[groups.length - 1].year === year) {
        groups[groups.length - 1].milestones.push(milestone);
      } else {
        groups.push({
          year,
          milestones: [milestone],
        });
      }
      return groups;
    }, []);
  }, [milestones]);
}
