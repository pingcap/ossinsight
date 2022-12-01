import { useGroupedMilestones, useMilestones } from '@site/src/components/milestone/hooks';
import React, { useMemo, useRef, useState } from 'react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, timelineItemClasses, TimelineSeparator } from '@mui/lab';
import MilestoneMessage from '@site/src/components/milestone/MilestoneMessage';
import { Badge, Button, Skeleton, styled, Tooltip } from '@mui/material';
import { H3 } from '@site/src/dynamic-pages/analyze/typography';
import { Milestone } from '@ossinsight/api';
import ScrollSpy from '@site/src/components/ScrollSpy';
import { ScrollSpyInstance } from '@site/src/components/ScrollSpy/ScrollSpy';
import SubscribeButton from '@site/src/components/milestone/SubscribeButton';
import { Experimental } from '@site/src/components/Experimental';
import { Notifications } from '@mui/icons-material';

interface MilestoneTimelineProps {
  repoId?: number;
  repoName?: string;
}

export default function MilestoneTimeline ({ repoId, repoName }: MilestoneTimelineProps) {
  const { data } = useMilestones(repoId);
  const [active, setActive] = useState(0);
  const groupedData = useGroupedMilestones(data?.data ?? []);
  const spyRef = useRef<ScrollSpyInstance | null>(null);

  const tabs = useMemo(() => {
    return groupedData.map(({ year }, index) => (
      <Tab
        className={index === active ? 'active' : undefined}
        key={year}
        onClick={() => spyRef.current?.scrollTo(index, 'smooth')}
      >
        {year}
      </Tab>
    ));
  }, [groupedData, active]);

  if (!data) {
    return (
      <Group>
        <H3>
          <Skeleton sx={{ maxWidth: 16 }} />
        </H3>
        {renderLoading()}
      </Group>
    );
  }

  return (
    <Container>
      <Timelines>
        <ScrollSpy offset={126} ref={spyRef} onVisibleElementChange={setActive}>
          {groupedData.map(({ year, milestones }) => (
            <Group id={`milestone-${year}`} key={year}>
              <H3>{year}</H3>
              {renderMilestones(milestones)}
            </Group>
          ))}
        </ScrollSpy>
      </Timelines>
      <TimeTabsContainer>
        <Sticky>
          {repoName && (
            <Experimental
              feature="milestone-subscription"
              fallback={(
                <Tooltip title="To be the first one who get the emails when this repository archives excellent milestones!">
                  <span>
                    <Badge color="primary" overlap="circular" badgeContent="COMING SOON" sx={{ '.MuiBadge-badge': { top: 0 } }}>
                      <Button variant="outlined" disabled sx={{ mb: 2 }} startIcon={<Notifications />}>
                        Get Updates
                      </Button>
                    </Badge>
                  </span>
                </Tooltip>
              )}
            >
              <SubscribeButton variant="contained" color="primary" repoName={repoName} />
            </Experimental>
          )}
          <TimeTabs sx={{ mt: 2 }}>
            {tabs}
          </TimeTabs>
        </Sticky>
      </TimeTabsContainer>
    </Container>
  );
}

const Container = styled('div')`
  display: flex;
  justify-content: space-between;
`;

const Timelines = styled('div')`
  max-width: 789px;
`;

const Group = styled('div')`
`;

const TimeTabsContainer = styled('div')`
  min-width: max-content;
  max-width: max-content;
`;

const Sticky = styled('div')`
  position: sticky;
  top: 160px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const TimeTabs = styled('div')`
  border-left: 1px solid #7c7c7c;
`;

const Tab = styled('div')`
  position: relative;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 8px;
  padding-left: 12px;
  color: #7c7c7c;
  transition: color .2s ease, opacity .2s ease;

  &:before {
    content: ' ';
    position: absolute;
    left: -1px;
    top: 0;
    width: 2px;
    height: 100%;
    background-color: transparent;
    transition: background-color .2s ease;
  }

  &.active {
    color: ${({ theme }) => theme.palette.primary.main};

    &:before {
      background-color: ${({ theme }) => theme.palette.primary.main};
    }
  }

  &:not(.active) {
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.palette.primary.main};
      opacity: .6;
    }
  }
`;

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

function renderMilestones (milestones: Milestone[]) {
  return (
    <Timeline
      sx={{
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
        [`& .${timelineItemClasses.root}`]: {
          minHeight: 52,
        },
      }}
    >
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        milestones.map(({ milestone_type_id, milestone_number, reached_at }, i, arr) => (
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
