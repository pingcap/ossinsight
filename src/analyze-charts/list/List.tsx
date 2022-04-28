import React, {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {HeaderItem,DataItem} from './styled';
import {HeadText, BodyText} from '../summary/styled'
import {useAnalyzeChartContext} from '../context';
import Typography from '@mui/material/Typography';

interface ListProps {
  n: number
  valueIndex: string
  nameIndex: string
  percentIndex: string
  title: string
  transformName?: (name: string) => string
}

const arr = n => Array(n).fill(true, 0, n)

export default function List ({n, valueIndex, nameIndex, percentIndex, title, transformName = name => name}: ListProps) {
  const { data } = useAnalyzeChartContext()

  const base = useMemo(() => arr(n), [n])
  return (
    <Stack direction='column' spacing={1} my={2}>
      <HeaderItem flex={1} p={2}>
        <BodyText sx={{fontSize: 16, lineHeight: 1}}>Top {n} {title}</BodyText>
      </HeaderItem>
      {base.map((_, i) => (
        <DataItem flex={1}>
          <Stack direction='row' px={2} py={1} alignItems='center' justifyContent='space-between'>
            <HeadText sx={{fontSize: 14, lineHeight: 1}}>
              {data.data?.data[i][nameIndex] ? transformName(data.data.data[i][nameIndex]) : undefined}
            </HeadText>
            <span>
              {data.data?.data[i][valueIndex]}
              &nbsp;
              <Typography
                variant="caption"
                component="span"
                color="text.secondary"
              >{`${(data.data?.data[i][percentIndex] * 100 || 0).toFixed(1)}%`}</Typography>
            </span>
          </Stack>
        </DataItem>
      ))}
    </Stack>
  )
}