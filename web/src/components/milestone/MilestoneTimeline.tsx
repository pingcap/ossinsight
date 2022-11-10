import { useMilestones } from '@site/src/components/milestone/hooks';
import React from 'react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, timelineItemClasses, TimelineSeparator } from '@mui/lab';
import MilestoneMessage from '@site/src/components/milestone/MilestoneMessage';

interface MilestoneTimelineProps {
  repoId?: number;
}

export default function MilestoneTimeline ({ repoId }: MilestoneTimelineProps) {
  const { data } = useMilestones(repoId);

  if (!data) {
    return <></>;
  }

  return (
    <Timeline
      sx={{
        maxWidth: 789,
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        data.data.map(({ id, milestone_type_id, milestone_number, reached_at }, i, arr) => (
          <TimelineItem key={id}>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: '#E78F34' }} />
              {i < arr.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <MilestoneMessage milestone_type_id={milestone_type_id} milestone_number={milestone_number} reached_at={reached_at} />
            </TimelineContent>
          </TimelineItem>
        ))
      }
    </Timeline>
  );
}
