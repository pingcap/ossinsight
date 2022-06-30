import Link from '@docusaurus/Link';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import MuiTableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import format from 'human-format';
import React, { useContext } from 'react';
import { withInViewContainer } from '../../../components/InViewContainer';
import CollectionsContext from '../context';
import { useCollectionMonthRank } from '../hooks/data';
import { useDimensionTabs } from '../hooks/useTabs';
import { withRemote } from '../hooks/withRemote';
import { H2, H3, P1, P2 } from './typograpy';
import { formatTime } from "./utils";

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

const TableCell = styled(MuiTableCell)(() => ({
  borderBottom: "1px solid #222"
}))

const NumberCell = styled(TableCell)(() => ({
  fontSize: 18,
  fontWeight: 'bold',
  '&> .diff': {
    fontSize: 16,
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: 4,
    '&> .diff-number': {
      fontSize: 14,
    },
  },
  whiteSpace: 'nowrap',
}));

const HeaderCell = styled(NumberCell)(() => ({
  fontSize: 20,
  fontWeight: 'bold',
}));


export default withInViewContainer(function MonthRankSection() {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs } = useDimensionTabs('monthly-rankings', true);
  const asyncData = useCollectionMonthRank(collection?.id, dimension.key);

  return (
    <section>
      <H2 id="monthly-rankings">Month-on-Month Ranking</H2>
      <P2>Table chart describes the Month-on-Month ranking of repos with three metrics（Star, Pull Request, Issue）.</P2>
      {tabs}
      <br />
      {withRemote(
        asyncData,
        data => (
          <>
            <H3 fontSize={14} align="center">
              Monthly Ranking - {dimension.title}
            </H3>
            <TableContainer>
              <Table className="clearTable" size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <HeaderCell>{formatTime(data.data[0]?.current_month)}</HeaderCell>
                    <HeaderCell>{formatTime(data.data[0]?.last_month)}</HeaderCell>
                    <HeaderCell>Repository</HeaderCell>
                    <HeaderCell>{dimension.title}</HeaderCell>
                    <HeaderCell sx={{ color: 'gray' }} align="right">Total</HeaderCell>
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
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar src={`https://github.com/${item.repo_name.split('/')[0]}.png`}
                                  sx={{ width: 20, height: 20 }} />
                          <Link to={`/analyze/${item.repo_name}`}
                                style={{ fontSize: 16, marginLeft: 8, whiteSpace: 'nowrap' }}>
                            {item.repo_name}
                          </Link>
                        </Stack>
                      </TableCell>
                      <NumberCell>
                        {item.current_month_total}
                        <Diff val={item.total_mom} suffix="%" />
                      </NumberCell>
                      <NumberCell sx={{ color: 'gray', fontWeight: 'normal' }} align="right">
                        {format(item.total, {separator: ''})}
                      </NumberCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ),
        () => (
          <>
            <H3 fontSize={14} align="center">
              Monthly Ranking - {dimension.title}
            </H3>
            <TableContainer>
              <Table className="clearTable" size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <HeaderCell><Skeleton variant="text" sx={{ display: 'inline-block' }} width={64} /></HeaderCell>
                    <HeaderCell><Skeleton variant="text" sx={{ display: 'inline-block' }} width={64} /></HeaderCell>
                    <HeaderCell>Repository</HeaderCell>
                    <HeaderCell>{dimension.title}</HeaderCell>
                    <HeaderCell sx={{ color: 'gray' }} align="right">Total</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array(10).fill(0).map((item, i) => (
                    <TableRow key={i}>
                      <NumberCell>
                        <Skeleton variant="text" sx={{ display: 'inline-block' }} width={32} />
                        <Diff val={0} reverse />
                      </NumberCell>
                      <NumberCell>
                        <Skeleton variant="text" sx={{ display: 'inline-block' }} width={32} />
                      </NumberCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Skeleton variant="circular" sx={{ display: 'inline-block' }} width={26} height={26} />
                          <Skeleton variant="text" sx={{ display: 'inline-block', flex: 1 }} height={26} />
                        </Stack>
                      </TableCell>
                      <NumberCell>
                        <Skeleton variant="text" sx={{ display: 'inline-block' }} width={32} />
                        <Diff val={0} suffix="%" />
                      </NumberCell>
                      <NumberCell sx={{ color: 'gray' }} align="right">
                        <Skeleton variant="text" sx={{ display: 'inline-block' }} width={32} />
                      </NumberCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ),
      )}
    </section>
  );
});
