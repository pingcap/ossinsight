import React, {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {DataItem, HeaderItem} from './styled';
import {BodyText, HeadText} from '../summary/styled';
import {useAnalyzeChartContext, useAnalyzeContext} from '../context';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

interface ListProps {
  n: number;
  valueIndex: string;
  nameIndex: string;
  percentIndex: string;
  title: string;
  transformName?: (name: string) => string;
}

const arr = n => Array(n).fill(true, 0, n);

export default function List({n, valueIndex, nameIndex, percentIndex, title, transformName = name => name}: ListProps) {
  const {comparingRepoName} = useAnalyzeContext();
  const {data, compareData} = useAnalyzeChartContext();

  const base = useMemo(() => arr(n), [n]);

  const group = comparingRepoName ? [compareData, data] : [data];
  return (
    <Stack direction="column" spacing={1} my={2}>
      <HeaderItem flex={1} px={2} py={1}>
        <BodyText sx={{fontSize: 14, lineHeight: 1}}>Top {n} {title}</BodyText>
      </HeaderItem>
      <Grid container spacing={0.5}>
        {base.map((_, i) => group.map((data, _, all) => (
          <Grid item xs={12 / all.length}>
            <DataItem flex={1}>
              <Stack direction="row" px={comparingRepoName ? 1 : 2} py={comparingRepoName ? 0.5 : 1} alignItems="center" justifyContent="space-between">
                <HeadText sx={{fontSize: 12, lineHeight: 1}}>
                  {data.data?.data[i][nameIndex] ? transformName(data.data.data[i][nameIndex]) : undefined}
                </HeadText>
                <span>
                  <BodyText sx={{fontSize: 12, lineHeight: 1}}>
                    {data.data?.data[i][valueIndex]}
                  </BodyText>
                  &nbsp;
                  <Typography
                    variant="caption"
                    component="span"
                    color="text.secondary"
                  >{`${(data.data?.data[i][percentIndex] * 100 || 0).toFixed(1)}%`}</Typography>
                </span>
              </Stack>
            </DataItem>
          </Grid>
        )))}
      </Grid>
    </Stack>
  );
}