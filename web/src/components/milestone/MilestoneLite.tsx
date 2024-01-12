import React, { useEffect, useMemo, useState } from 'react';
import { useMilestones } from '@site/src/components/milestone/hooks';
import MilestoneMessage from '@site/src/components/milestone/MilestoneMessage';
import { isNullish, notNullish } from '@site/src/utils/value';
import { styled } from '@mui/material';
import { Milestone } from '@ossinsight/api';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

interface MilestoneLiteProps {
  repoId?: number;
  interval?: number;
}

export function MilestoneLite ({ repoId, interval = 2500 }: MilestoneLiteProps) {
  const { data } = useMilestones(repoId);

  return (
    <Container>
      <Icon>
        🎉
      </Icon>
      <Milestones milestones={data?.data} interval={interval} />
    </Container>
  );
}

const Milestones = ({ milestones, interval }: { milestones: Milestone[] | undefined, interval: number }) => {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (notNullish(milestones) && milestones.length > 0) {
      const h = setInterval(() => {
        setI(i => ((i + 1) % milestones.length));
      }, interval);

      return () => clearInterval(h);
    }
  }, [milestones?.length, interval]);

  const key = useMemo(() => {
    if (isNullish(milestones)) {
      return 'loading';
    } else if (milestones.length === 0) {
      return 'no-data';
    } else {
      return `message-${i}`;
    }
  }, [milestones, i]);

  return (
    <TransitionGroup component={TransitionsContainer}>
      <CSSTransition key={key} timeout={500} classNames="item">
        {(() => {
          if (isNullish(milestones)) {
            return <DefaultMessage key="loading">Loading</DefaultMessage>;
          } else if (milestones.length === 0) {
            return <DefaultMessage key="no-data">No Highlights yet</DefaultMessage>;
          } else {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { milestone_number, milestone_type_id, reached_at } = milestones[i];
            return <MilestoneMessage key={`message-${i}`} milestone_type_id={milestone_type_id} milestone_number={milestone_number} reached_at={reached_at} />;
          }
        })()}
      </CSSTransition>
    </TransitionGroup>
  );
};

const Container = styled('div')`
  align-self: center;
  display: flex;
  flex-wrap: nowrap;
  background: #333;
  border-radius: 69px;
  max-height: 48px;
  min-height: 48px;
  align-items: center;
  padding: 0 18px;
  max-width: 420px;
  width: 100%;
  position: relative;
`;

const TransitionsContainer = styled('div')`
  position: relative;
  align-self: stretch;
  flex: 1;

  & > * {
    position: absolute;
    width: 100%;
    height: 100%;
    transition: all .25s ease;
  }

  & > .item-enter {
    opacity: 0;
    transform: translate3d(0, 30%, 0);
  }
  & > .item-enter-active {
    opacity: 1;
    transform: none;
  }
  & > .item-exit {
    opacity: 1;
    transform: none;
  }
  & > .item-exit-active {
    opacity: 0;
    transform: translate3d(0, -30%, 0);
  }
`;

const DefaultMessage = styled('div')`
  color: #7c7c7c;
  font-size: 14px;
  height: 100%;
  display: flex;
  align-items: center;
`;

const Icon = styled('span')`
  margin-right: 8px;
`;
