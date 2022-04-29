import React from 'react';
import {useAnalyzeContext} from '../context';
import Grid from '@mui/material/Grid';
import {StaticSummaryItem, SummaryItem} from './SummaryItem';
import {HeaderGrid, HeadText} from './styled';
import Skeleton from '@mui/material/Skeleton';
import Analyze from '../Analyze';
import Stack from '@mui/material/Stack';
import {RepoInfo} from '../../api/gh';

export type ItemBase = {
  icon?: React.ReactNode
  title: React.ReactNode
}

export type QueryItem = ItemBase & {
  query: string
  field: any;
}

export type StaticItem = ItemBase & {
  data?: (repoInfo: RepoInfo) => any
  comparingData?: any
}

export interface SummaryProps {
  items: (QueryItem | StaticItem)[];
}

const singleSize = [4, 6] as const;
const compareSize = [4, 3] as const;

export default function Summary({items}: SummaryProps) {
  const {comparingRepoId, repoName, comparingRepoName} = useAnalyzeContext();

  const sizes = comparingRepoId ? compareSize : singleSize;

  return (
    <Stack gap={1}>
      <Grid container gap={1} wrap="nowrap">
        <HeaderGrid item xs={4} md={sizes[0]}>
          &nbsp;
        </HeaderGrid>
        <HeaderGrid item xs={4} md={sizes[1]} sx={{textAlign: 'right'}}>
          <HeadText>
            {repoName}
          </HeadText>
        </HeaderGrid>
        {comparingRepoId
          ? (
            <HeaderGrid item xs={4} md={sizes[1]} sx={{textAlign: 'right'}}>
              <HeadText>
                {comparingRepoName ?? <Skeleton variant="text" />}
              </HeadText>
            </HeaderGrid>)
          : undefined}
      </Grid>
      {items.map((item, i) => {
        if ('query' in item) {
          const {query, ...props} = item;
          return (
            <Analyze query={query}>
              <SummaryItem container flexWrap="nowrap" gap={1} {...props} sizes={sizes} key={query} />
            </Analyze>
          );
        } else {
          const {data, comparingData, ...props} = item;
          return <StaticSummaryItem container flexWrap="nowrap" gap={1} data={data}
                                    comparingData={comparingData} {...props} sizes={sizes} key={i} />;
        }
      })}
    </Stack>
  );
}
