import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React, { useContext, useEffect } from 'react';
import CollectionsContext from '../context';
import { useCollectionMonthRank } from '../hooks/data';
import { useDimensionTabs } from '../hooks/useTabs';
import { withRemote } from '../hooks/withRemote';

const df = new Intl.DateTimeFormat(['en-US'], {
  month: 'short',
  year: 'numeric',
});
const formatTime = (name: string): string => df.format(new Date(name));

const formatNumber = (v: number) => v.toFixed(1).replace(/[.,]0$/, "")

const Diff = ({ val, suffix }: { val: number, suffix?: string }) => {
  if (val > 0) {
    return (
      <span className='diff' style={{ color: '#52FF52' }}>
        <ArrowUpwardIcon fontSize='inherit' sx={{ verticalAlign: 'text-bottom' }} />
        {formatNumber(val)}{suffix}
      </span>
    );
  } else if (val < 0) {
    return (
      <span className='diff' style={{ color: '#E30C34' }}>
        <ArrowDownwardIcon fontSize='inherit' sx={{ verticalAlign: 'text-bottom' }} />
        {formatNumber(val)}{suffix}
      </span>
    );
  } else {
    return <span className='diff' style={{ color: 'gray' }}>--</span>;
  }
};

const NumberCell = styled(TableCell)(() => ({
  fontSize: 18,
  fontWeight: 'bold',
  '&> .diff': {
    fontSize: 14,
    verticalAlign: 'text-bottom',
    marginLeft: 4,
  }
}))

const HeaderCell = styled(TableCell)(() => ({
  fontSize: 20,
  fontWeight: 'bold'
}))


export default function MonthRankSection() {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs } = useDimensionTabs(true);
  const asyncData = useCollectionMonthRank(collection.id, dimension.key);

  useEffect(() => {
    if (asyncData.data) {
      asyncData.data.data.sort((a, b) => a.current_month_rank - b.current_month_rank)
    }
  }, [asyncData.data])

  return (
    <Container>
      {tabs}
      <br />
      {withRemote(
        asyncData,
        data => (
          <TableContainer component={Paper}>
            <Table className="clearTable">
              <TableHead>
                <TableRow>
                  <HeaderCell>{formatTime(data.data[0].current_month)}</HeaderCell>
                  <HeaderCell>{formatTime(data.data[0].last_month)}</HeaderCell>
                  <HeaderCell>Repository</HeaderCell>
                  <HeaderCell>Star Earned</HeaderCell>
                  <HeaderCell sx={{ color: 'gray' }}>Total</HeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map(item => (
                  <TableRow key={item.repo_name}>
                    <NumberCell>
                      {item.current_month_rank}
                      <Diff val={item.rank_mom} />
                    </NumberCell>
                    <NumberCell>
                      {item.last_month_rank}
                    </NumberCell>
                    <TableCell>
                      <Avatar src={`https://github.com/${item.repo_name.split('/')[0]}.png`} sx={{ display: 'inline-block', verticalAlign: 'text-bottom', width: 20, height: 20 }} />
                      <a href={`https://github.com/${item.repo_name}`} target='_blank' style={{ fontSize: 16, marginLeft: 8 }}>
                        {item.repo_name}
                      </a>
                    </TableCell>
                    <NumberCell>
                      {item.current_month_total}
                      <Diff val={item.total_mom} suffix='%' />
                    </NumberCell>
                    <NumberCell sx={{ color: 'gray' }}>
                      {item.total}
                    </NumberCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ),
      )}
    </Container>
  );
}