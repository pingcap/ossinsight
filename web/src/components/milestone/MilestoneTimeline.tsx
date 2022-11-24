import { useGroupedMilestones, useMilestones } from '@site/src/components/milestone/hooks';
import React from 'react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, timelineItemClasses, TimelineSeparator } from '@mui/lab';
import MilestoneMessage from '@site/src/components/milestone/MilestoneMessage';
import { Badge, Button, Skeleton, styled, Tooltip } from '@mui/material';
import { MailOutline as MailOutlineIcon } from '@mui/icons-material';
import { H3 } from '@site/src/dynamic-pages/analyze/typography';
import { Milestone } from '@ossinsight/api';
import ScrollSpy from '@site/src/components/ScrollSpy';

interface MilestoneTimelineProps {
  repoId?: number;
}

export default function MilestoneTimeline ({ repoId }: MilestoneTimelineProps) {
  const { data } = useMilestones(repoId);

  const groupedData = useGroupedMilestones(data?.data ?? []);

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
    <ScrollSpy<number> offset={-126}>
      {({ ref, active, scrollTo, keys }) => (
        <Container>
          <Timelines>
            {groupedData.map(({ year, milestones }, index) => (
              <Group id={`milestone-${year}`} key={year} ref={el => ref(el, year)}>
                <H3>{year}</H3>
                {renderMilestones(milestones)}
              </Group>
            ))}
          </Timelines>
          <TimeTabsContainer>
            <Sticky>
              <Tooltip title="To be the first one who get the emails when this repository archives excellent milestones!">
                <span>
                  <Badge color="primary" overlap="circular" badgeContent="COMING SOON" sx={{ '.MuiBadge-badge': { top: 0 } }}>
                    <Button variant='outlined' disabled sx={{ mb: 2 }} startIcon={<MailOutlineIcon />}>
                      Get Updates
                    </Button>
                  </Badge>
                </span>
              </Tooltip>
              <TimeTabs>
                {keys.filter(year => year).map((year) => (
                  <Tab
                    className={year === active ? 'active' : undefined}
                    key={year}
                    onClick={() => scrollTo(year)}
                  >
                    {year}
                  </Tab>
                ))}
              </TimeTabs>
            </Sticky>
          </TimeTabsContainer>
        </Container>
      )}
    </ScrollSpy>
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
