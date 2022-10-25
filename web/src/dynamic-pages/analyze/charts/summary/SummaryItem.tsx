import React from 'react';
import Grid, {GridProps} from '@mui/material/Grid';
import {BodyText, DataGrid, HeaderGrid, HeadText} from './styled';
import {useAnalyzeChartContext, useAnalyzeContext} from '../context';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {AsyncData, RemoteData} from '../../../../components/RemoteCharts/hook';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import type {RepoInfo} from '@ossinsight/api';

export interface SummaryItemProps<F extends string> extends Omit<GridProps, 'title'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  alt: string;
  field: F;
  sizes: readonly [number, number];
}


export interface StaticSummaryItemProps extends Omit<GridProps, 'title'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  data?: (repoInfo: RepoInfo) => any;
  comparingData?: any;
  sizes: readonly [number, number];
}

function getData<K extends string>(data: AsyncData<RemoteData<unknown, Record<K, number>>>, key: K): number | undefined {
  const item = data.data?.data[0];
  if (!item) {
    return undefined;
  }
  if (key === '*') {
    return Object.values(item)[0] as any;
  } else {
    return item[key];
  }
}

export function SummaryItem<F extends string>({title, icon, sizes, field, ...gridProps}: SummaryItemProps<F>) {
  const {comparingRepoId} = useAnalyzeContext();
  const {data, compareData} = useAnalyzeChartContext<Record<F, number>>();

  return (
    <Grid {...gridProps}>
      <HeaderGrid item xs={sizes[0]}>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
          {icon}
          <Tooltip title={title} arrow disableHoverListener enterTouchDelay={0}>
            <HeadText>{title}</HeadText>
          </Tooltip>
        </Stack>
      </HeaderGrid>
      <DataGrid item xs={sizes[1]}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
          <BodyText>
            {getData(data, field) ?? <CircularProgress sx={{verticalAlign: -2}} size={24} />}
          </BodyText>
        </Stack>
      </DataGrid>
      {comparingRepoId
        ? (
          <DataGrid item xs={sizes[1]}>
            <BodyText>
              {getData(compareData, field) ?? <CircularProgress sx={{verticalAlign: -2}} size={24} />}
            </BodyText>
          </DataGrid>
        ) : undefined}
    </Grid>
  );
}

export function StaticSummaryItem({title, icon, sizes, data, comparingData, ...gridProps}: StaticSummaryItemProps) {
  const {comparingRepoId, repoInfo, comparingRepoInfo} = useAnalyzeContext();

  return (
    <Grid {...gridProps}>
      <HeaderGrid item xs={sizes[0]}>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
          {icon}
          <HeadText>{title}</HeadText>
        </Stack>
      </HeaderGrid>
      <DataGrid item xs={sizes[1]}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
          <BodyText>
            {repoInfo ? data(repoInfo) : <CircularProgress sx={{verticalAlign: -2}} size={24} />}
          </BodyText>
        </Stack>
      </DataGrid>
      {comparingRepoId
        ? (
          <DataGrid item xs={sizes[1]}>
            <BodyText>
              {comparingRepoInfo ? data(comparingRepoInfo) : <Skeleton variant="text" />}
            </BodyText>
          </DataGrid>
        ) : undefined}
    </Grid>
  );
}