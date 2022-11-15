import { useMilestones } from '@site/src/components/milestone/hooks';
import React from 'react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, timelineItemClasses, TimelineSeparator } from '@mui/lab';
import MilestoneMessage from '@site/src/components/milestone/MilestoneMessage';
import { Skeleton } from '@mui/material';

interface MilestoneTimelineProps {
  repoId?: number;
}

export default function MilestoneTimeline ({ repoId }: MilestoneTimelineProps) {
  const { data } = useMilestones(repoId);

  if (!data) {
    return renderLoading();
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
        data.data.map(({ milestone_type_id, milestone_number, reached_at }, i, arr) => (
          <TimelineItem key={i}>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: '#E78F34' }} />
              {i < arr.length - 1 && <TimelineConnector sx={{ bgcolor: '#7c7c7c' }} />}
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

function renderLoading () {
  return (
    <Timeline
      sx={{
        maxWidth: 789,
        minHeight: '80vh',
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {[1, 2, 3, 4, 5].map(n => (
        <TimelineItem key={n}>
          <TimelineSeparator>
            <TimelineDot sx={{ bgcolor: '#E78F34' }} />
            {n < 5 && <TimelineConnector sx={{ bgcolor: '#7c7c7c' }} />}
          </TimelineSeparator>
          <TimelineContent>
            <Skeleton />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
