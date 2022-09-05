import React from 'react';
import {useAnalyzeContext} from '../context';
import Grid from '@mui/material/Grid';
import {StaticSummaryItem, SummaryItem} from './SummaryItem';
import {HeaderGrid, HeadText} from './styled';
import Skeleton from '@mui/material/Skeleton';
import Analyze from '../Analyze';
import Stack from '@mui/material/Stack';
import type {RepoInfo} from '@ossinsight/api';

export type ItemBase = {
  icon?: React.ReactNode
  title: React.ReactNode
  alt: string
}

export type QueryItem = ItemBase & {
  field: any;
}

export type StaticItem = ItemBase & {
  data?: (repoInfo: RepoInfo) => any
  comparingData?: any
}

export interface SummaryProps {
  query: string
  items: (QueryItem | StaticItem)[];
}

const singleSize = [4, 6] as const;
const compareSize = [4, 3] as const;

export default function Summary({items, query}: SummaryProps) {
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
      <Analyze query={query}>
        {items.map((item, i) => {
          if ('field' in item) {
            return (
              <SummaryItem container flexWrap="nowrap" gap={1} {...item} sizes={sizes} key={item.field} />
            );
          } else {
            const {data, comparingData, ...props} = item;
            return <StaticSummaryItem key={i} container flexWrap="nowrap" gap={1} data={data}
                                      comparingData={comparingData} {...props} sizes={sizes} />;
          }
        })}
      </Analyze>
    </Stack>
  );
}
