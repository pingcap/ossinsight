import React, {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {HeaderItem,DataItem} from './styled';
import {HeadText, BodyText} from '../summary/styled'
import {useAnalyzeChartContext} from '../context';
import CircularProgressWithLabel from './CircularProgressWithLabel';

interface ListProps {
  n: number
  valueIndex: string
  nameIndex: string
  percentIndex: string
  title: string
}

const arr = n => Array(n).fill(true, 0, n)

export default function List ({n, valueIndex, nameIndex, percentIndex, title}: ListProps) {
  const { data } = useAnalyzeChartContext()

  const base = useMemo(() => arr(n), [n])
  return (
    <Stack direction='column' spacing={1} my={2}>
      <HeaderItem flex={1}>
        <BodyText sx={{px: 2}}>Top {n} {title}</BodyText>
      </HeaderItem>
      {base.map((_, i) => (
        <DataItem flex={1} sx={{py: 1}}>
          <Stack direction='row' px={2} alignItems='center' justifyContent='space-between'>
            <HeadText>
              {data.data?.data[i][nameIndex]}
              &nbsp;
              {data.data?.data[i][valueIndex]}
            </HeadText>
            <CircularProgressWithLabel value={data.data?.data[i][percentIndex] * 1000 || 0} sign='‰'/>
          </Stack>
        </DataItem>
      ))}
    </Stack>
  )
}