import { GitMergeIcon, IssueOpenedIcon, PersonIcon, StarIcon } from '@primer/octicons-react';
import React from 'react';
import styles from '../analyze/styles.module.css';
import { Box } from '@mui/material';

export type Dimension = {
  icon?: JSX.Element;
  title: string;
  key: 'stars' | 'pull-requests' | 'pull-request-creators' | 'issues';
  search: null | 'prs' | 'pr-creators' | 'issues';
  prefix?: string;
};

const PrCreatorIcon = ({ size }: { size: number }) => (
  <Box display='inline-block' position='relative'>
    <PersonIcon size={size} />
    <GitMergeIcon size={size / 3} className={styles.subIcon} />
  </Box>
);

const dimensions: Dimension[] = [
  { title: 'Stars', key: 'stars', search: null, prefix: 'stars', icon: <StarIcon size={18} /> },
  { title: 'Pull Requests', key: 'pull-requests', search: 'prs', prefix: 'prs', icon: <GitMergeIcon size={18}/> },
  { title: 'Pull Request Creators', key: 'pull-request-creators', search: 'pr-creators', icon: <PrCreatorIcon size={18}/> },
  { title: 'Issues', key: 'issues', search: 'issues', prefix: 'issues', icon: <IssueOpenedIcon size={18}/> },
];

export default dimensions;

export enum CollectionDateTypeEnum {
  Last28Days = 'last-28-days',
  Month = 'month',
}

export const collectionDisplayType = [
  { type: CollectionDateTypeEnum.Last28Days, tableTitle: 'Last 28 days', label: 'Last 28 Days' },
  { type: CollectionDateTypeEnum.Month, tableTitle: 'Monthly', label: 'Month-to-Month' },
];
