import React, { useMemo } from 'react';
import { useAnalyzeChartContext, useAnalyzeContext } from '../context';
import { BodyText, HeadText } from '../summary/styled';
import { DataItem, HeaderItem } from './styled';
import { notFalsy, notNullish } from '@site/src/utils/value';

import { Box, Grid, Stack, Typography } from '@mui/material';

interface ListProps {
  n: number;
  valueIndex?: string;
  nameIndex: string;
  percentIndex: string;
  title: string;
  transformName?: (name: string) => string;
}

const arr = n => Array(n).fill(true, 0, n);

export default function List ({ n, valueIndex, nameIndex, percentIndex, title, transformName = name => name }: ListProps) {
  const { repoName, comparingRepoName } = useAnalyzeContext();
  const { data, compareData } = useAnalyzeChartContext<any>();

  const base = useMemo(() => arr(n), [n]);

  const group = comparingRepoName ? [data, compareData] : [data];
  return (
    <Stack direction="column" spacing={1} my={2}>
      <HeaderItem flex={1} px={2} py={1}>
        <BodyText sx={{ fontSize: 14, lineHeight: 1 }}>Top {n} {title}</BodyText>
      </HeaderItem>
      <Grid container spacing={0.5}>
        {comparingRepoName
          ? (group.map((_, i, all) => (
            <Grid item xs={12 / all.length} key={`head-${i}`}>
              <Box flex={1} px={1} sx={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}>
                <BodyText>
                  <span style={{
                    display: 'inline-block',
                    marginRight: '4px',
                    borderRadius: '10px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: ['#dd6b66', '#759aa0'][i],
                  }}/>
                  {[repoName, comparingRepoName][i]}
                </BodyText>
              </Box>
            </Grid>),
            ))
          : undefined}
        {base.map((_, i) => group.map((data, index, all) => (
          <Grid item xs={12 / all.length} key={`${i}-${index}`}>
            <DataItem flex={1}>
              <Stack direction="row" px={comparingRepoName ? 1 : 2} py={comparingRepoName ? 0.5 : 1} alignItems="center" justifyContent="space-between">
                <HeadText sx={{ fontSize: 12, lineHeight: 1 }}>
                  {(notNullish(data.data) && i < data.data.data.length)
                    ? notFalsy(data.data.data[i][nameIndex])
                      ? transformName(data.data.data[i][nameIndex])
                      : undefined
                    : '--'}
                </HeadText>
                <span>
                  {valueIndex && notNullish(data.data) && i < data.data.data.length
                    ? (
                      <BodyText sx={{ fontSize: 12, lineHeight: 1 }}>
                        {data.data?.data[i][valueIndex]}
                      </BodyText>
                      )
                    : undefined}
                  &nbsp;
                  {notNullish(data.data) && i < data.data.data.length
                    ? (
                      <Typography
                        variant="caption"
                        component="span"
                        color="text.secondary"
                      >{`${(data.data?.data[i][percentIndex] * 100 || 0).toFixed(1)}%`}</Typography>
                      )
                    : undefined}
                </span>
              </Stack>
            </DataItem>
          </Grid>
        )))}
      </Grid>
    </Stack>
  );
}
