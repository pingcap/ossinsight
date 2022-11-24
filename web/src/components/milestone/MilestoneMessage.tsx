import React, { HTMLAttributes, ReactNode, useMemo } from 'react';
import type { Milestone } from '@ossinsight/api';
import { styled } from '@mui/material';
import { GitMergeIcon, GitPullRequestIcon, IssueOpenedIcon, StarIcon } from '@primer/octicons-react';
import styles from './style.module.css';
import { useFindCollectionById } from '@site/src/dynamic-pages/collections/hooks/useCollection';
import Link from '@docusaurus/Link';

const enum MilestoneType {
  StarsEarned = 1,
  PullRequestsMerged,
  PullRequestCreatorsHad,
  IssuesReceived,
  ShowInTrendingRepos,
  AddedInCollections,
}

interface MileStoneRenderingProps extends Pick<Milestone, 'milestone_number' | 'milestone_type_id' | 'reached_at'> {
}

interface MilestoneMessageProps extends MileStoneRenderingProps, HTMLAttributes<HTMLSpanElement> {
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function MilestoneMessage ({ milestone_number, milestone_type_id, reached_at, ...props }: MilestoneMessageProps) {
  const template: MilestoneTemplate = config[milestone_type_id] ?? DEFAULT_TEMPLATE;
  const findCollectionById = useFindCollectionById();
  return (
    <Container {...props}>
      <Verb>{template.verb}</Verb>
      &nbsp;
      <Content>
        {
          'render' in template
            ? template.render({ milestone_number, milestone_type_id, reached_at }, { findCollectionById })
            : (
              <>
                {template.icon} {milestone_number}+ {template.unit}
              </>
              )
        }

      </Content>
      <DateTime>{format(reached_at)}</DateTime>
    </Container>
  );
}

type MilestoneTemplate = {
  verb: string;
  icon: ReactNode;
  unit: string;
} | {
  verb: string;
  render: (milestone: MileStoneRenderingProps, ctx: { findCollectionById: ReturnType<typeof useFindCollectionById> }) => ReactNode;
};

const DEFAULT_TEMPLATE: MilestoneTemplate = {
  verb: 'Archived',
  render: () => 'Cuius rei demonstrationem mirabilem sane detexi. Hanc marginis exiguitas non caperet.',
};

const config: Record<MilestoneType, MilestoneTemplate> = {
  [MilestoneType.StarsEarned]: {
    verb: 'Earned',
    icon: <StarIcon className={styles.ghIcon} />,
    unit: 'Stars',
  },
  [MilestoneType.PullRequestsMerged]: {
    verb: 'Merged',
    icon: <GitMergeIcon className={styles.ghIcon} />,
    unit: 'Pull Requests',
  },
  [MilestoneType.PullRequestCreatorsHad]: {
    verb: 'Had',
    icon: <GitPullRequestIcon className={styles.ghIcon} />,
    unit: 'Pull Request Creators',
  },
  [MilestoneType.IssuesReceived]: {
    verb: 'Received',
    icon: <IssueOpenedIcon className={styles.ghIcon} />,
    unit: 'Issues',
  },
  [MilestoneType.ShowInTrendingRepos]: {
    verb: 'Shown',
    render: milestone => (
      <>
        In trending repos ranked {milestone.milestone_number}
      </>
    ),
  },
  [MilestoneType.AddedInCollections]: {
    verb: 'Added',
    render: (milestone, { findCollectionById }) => (
      <>
        In <CollectionLink id={milestone.milestone_number} findCollectionById={findCollectionById} />
      </>
    ),
  },
};

const fmt = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
});

function format (time: string) {
  return useMemo(() => {
    return fmt.format(new Date(time));
  }, [time]);
}

const Container = styled('span')`
  display: flex;
  flex: 1;
  align-items: center;
  line-height: 1.25;
`;

const Verb = styled('span')`
  color: #aaa;
  font-size: 14px;
`;

const Content = styled('span')`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  flex: 1;
`;

const DateTime = styled('span')`
  color: #7c7c7c;
  font-size: 12px;
  padding-left: 24px;
`;

const CollectionLink = ({ id, findCollectionById }: { id: number, findCollectionById: ReturnType<typeof useFindCollectionById> }) => {
  const collection = useMemo(() => findCollectionById(id), [findCollectionById, id]);
  if (!collection) {
    return <span>Unknown Collection</span>;
  } else {
    return <Link href={`/collections/${collection.slug}`}>{collection.name} Collection</Link>;
  }
};
