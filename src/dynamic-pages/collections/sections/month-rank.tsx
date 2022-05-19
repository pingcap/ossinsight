import Link from '@docusaurus/Link';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React, { useContext } from 'react';
import { withInViewContainer } from '../../../components/InViewContainer';
import CollectionsContext from '../context';
import { useCollectionMonthRank } from '../hooks/data';
import { useDimensionTabs } from '../hooks/useTabs';
import { withRemote } from '../hooks/withRemote';
import { H2, P1 } from './typograpy';

const df = new Intl.DateTimeFormat(['en-US'], {
  month: 'short',
  year: 'numeric',
});
const formatTime = (name: string): string => df.format(new Date(name));

const formatNumber = (v: number) => v.toFixed(1).replace(/[.,]0$/, '');

const up = <ArrowUpwardIcon fontSize="inherit" sx={{ verticalAlign: 'text-bottom' }} />;
const down = <ArrowDownwardIcon fontSize="inherit" sx={{ verticalAlign: 'text-bottom' }} />;
const red = '#E30C34';
const green = '#52FF52';
const Diff = ({ val, suffix, reverse = false }: { val: number, suffix?: string, reverse?: boolean }) => {
  if (val > 0) {
    return (
      <span className="diff" style={{ color: reverse ? red : green }}>
        {reverse ? down : up}
        <span className="diff-number">
          {formatNumber(val)}{suffix}
        </span>
      </span>
    );
  } else if (val < 0) {
    return (
      <span className="diff" style={{ color: reverse ? green : red }}>
        {reverse ? up : down}
        <span className="diff-number">
          {formatNumber(-val)}{suffix}
        </span>
      </span>
    );
  } else {
    return <span className="diff" style={{ color: 'gray' }}></span>;
  }
};

const NumberCell = styled(TableCell)(() => ({
  fontSize: 18,
  fontWeight: 'bold',
  '&> .diff': {
    fontSize: 16,
    verticalAlign: 'text-bottom',
    marginLeft: 4,
    '&> .diff-number': {
      fontSize: 14,
    },
  },
}));

const HeaderCell = styled(TableCell)(() => ({
  fontSize: 20,
  fontWeight: 'bold',
}));


export default withInViewContainer(function MonthRankSection() {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs } = useDimensionTabs(true);
  const asyncData = useCollectionMonthRank(collection?.id, dimension.key);

  return (
    <section>
      <H2 id='month-rank'>Monthly Ranking</H2>
      <P1>Simple monthly ranking by number of stars, pull requests or issues earned this month</P1>
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
                      <Diff val={item.rank_mom} reverse />
                    </NumberCell>
                    <NumberCell>
                      {item.last_month_rank}
                    </NumberCell>
                    <TableCell>
                      <Avatar src={`https://github.com/${item.repo_name.split('/')[0]}.png`}
                              sx={{ display: 'inline-block', verticalAlign: 'text-bottom', width: 20, height: 20 }} />
                      <Link to={`/analyze/${item.repo_name}`} style={{ fontSize: 16, marginLeft: 8 }}>
                        {item.repo_name}
                      </Link>
                    </TableCell>
                    <NumberCell>
                      {item.current_month_total}
                      <Diff val={item.total_mom} suffix="%" />
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
        () => (
          <TableContainer component={Paper}>
            <Table className="clearTable">
              <TableHead>
                <TableRow>
                  <HeaderCell><Skeleton variant="text" /></HeaderCell>
                  <HeaderCell><Skeleton variant="text" /></HeaderCell>
                  <HeaderCell>Repository</HeaderCell>
                  <HeaderCell>Star Earned</HeaderCell>
                  <HeaderCell sx={{ color: 'gray' }}>Total</HeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array(10).fill(0).map(item => (
                  <TableRow key={item.repo_name}>
                    <NumberCell>
                      <Skeleton variant="text" />
                      <Diff val={0} reverse />
                    </NumberCell>
                    <NumberCell>
                      <Skeleton variant="text" />
                    </NumberCell>
                    <TableCell>
                      <Skeleton variant="circular" sx={{ display: 'inline-block' }} width={16} height={16} />
                      <Skeleton variant="text" sx={{ ml: 1, display: 'inline-block' }} />
                    </TableCell>
                    <NumberCell>
                      <Skeleton variant="text" />
                      <Diff val={0} suffix="%" />
                    </NumberCell>
                    <NumberCell sx={{ color: 'gray' }}>
                      <Skeleton variant="text" />
                    </NumberCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ),
      )}
    </section>
  );
});
