import Link from '@docusaurus/Link';
import format from 'human-format';
import React, { useContext } from 'react';
import { withInViewContainer } from '../../../components/InViewContainer';
import CollectionsContext from '../context';
import { useCollectionMonthRank } from '../hooks/data';
import { useDimensionTabs } from '../hooks/useTabs';
import { withRemote } from '../hooks/withRemote';
import { H2, H3, P2 } from './typograpy';
import { formatTime } from './utils';
import Diff from '../../../components/Diff';
import { CollectionDateTypeEnum, collectionDisplayType } from '../dimensions';

import {
  Avatar,
  Skeleton,
  Stack,
  styled,
  Table,
  TableBody,
  TableCell as MuiTableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const TableCell = styled(MuiTableCell)(() => ({
  borderBottom: '1px solid #222',
}));

const NumberCell = styled(TableCell)(() => ({
  fontSize: 18,
  fontWeight: 'bold',
  '&> .diff': {
    fontSize: 16,
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: 4,
  },
  whiteSpace: 'nowrap',
}));

const HeaderCell = styled(NumberCell)(() => ({
  fontSize: 20,
  fontWeight: 'bold',
}));

export default withInViewContainer(function MonthRankSection () {
  const { collection } = useContext(CollectionsContext);

  const { dimension, tabs, dateType } = useDimensionTabs('monthly-rankings', true);
  const asyncData = useCollectionMonthRank(collection?.id, dimension.key, dateType);

  return (
    <section>
      <H2 id="monthly-rankings">Last 28 Days / Month-to-Month Ranking</H2>
      <P2>
        The following table ranks repositories using three metrics: stars, pull
        requests, and issues. The table compares last 28 days or the most recent
        two months of data and indicates whether repositories are moving up or
        down the rankings.
      </P2>
      {tabs}
      <br />
      {withRemote(
        asyncData,
        (data) => (
          <>
            <H3 fontSize={14} align="center">
              {`${collectionDisplayType.find((i) => i.type === dateType)?.tableTitle ?? 'unknown'} Ranking - ${dimension.title}`}
            </H3>
            <TableContainer>
              <Table className="clearTable" size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {dateType === CollectionDateTypeEnum.Month && (
                      <HeaderCell>
                        {formatTime(data.data[0]?.current_month)}
                      </HeaderCell>
                    )}
                    {dateType === CollectionDateTypeEnum.Month && (
                      <HeaderCell>
                        {formatTime(data.data[0]?.last_month)}
                      </HeaderCell>
                    )}
                    {dateType === CollectionDateTypeEnum.Last28Days && (
                      <HeaderCell>Last 28 Days</HeaderCell>
                    )}
                    <HeaderCell>Repository</HeaderCell>
                    <HeaderCell>{dimension.title}</HeaderCell>
                    <HeaderCell sx={{ color: 'gray' }} align="right">
                      Total
                    </HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.data.map((item) => (
                    <TableRow key={item.repo_name}>
                      {dateType === CollectionDateTypeEnum.Month && (
                        <NumberCell>
                          {item.current_month_rank}
                          <Diff val={item.rank_mom} reverse />
                        </NumberCell>
                      )}
                      {dateType === CollectionDateTypeEnum.Month && (
                        <NumberCell>{item.last_month_rank}</NumberCell>
                      )}
                      {dateType === CollectionDateTypeEnum.Last28Days && (
                        <NumberCell>
                          {item.last_period_rank}
                          <Diff val={item.rank_pop} reverse />
                        </NumberCell>
                      )}
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            src={`https://github.com/${
                              item.repo_name?.split('/')[0]
                            }.png`}
                            sx={{ width: 20, height: 20 }}
                          />
                          <Link
                            to={`/analyze/${item.repo_name}`}
                            style={{
                              fontSize: 16,
                              marginLeft: 8,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.repo_name}
                          </Link>
                        </Stack>
                      </TableCell>
                      {
                        <NumberCell>
                          {item.current_month_total || item.last_period_total}
                          <Diff
                            val={item.total_mom || item.total_pop}
                            suffix="%"
                          />
                        </NumberCell>
                      }
                      <NumberCell
                        sx={{ color: 'gray', fontWeight: 'normal' }}
                        align="right"
                      >
                        {format(item.total, { separator: '' })}
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
                    <HeaderCell>
                      <Skeleton
                        variant="text"
                        sx={{ display: 'inline-block' }}
                        width={64}
                      />
                    </HeaderCell>
                    <HeaderCell>
                      <Skeleton
                        variant="text"
                        sx={{ display: 'inline-block' }}
                        width={64}
                      />
                    </HeaderCell>
                    <HeaderCell>Repository</HeaderCell>
                    <HeaderCell>{dimension.title}</HeaderCell>
                    <HeaderCell sx={{ color: 'gray' }} align="right">
                      Total
                    </HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array(10)
                    .fill(0)
                    .map((item, i) => (
                      <TableRow key={i}>
                        <NumberCell>
                          <Skeleton
                            variant="text"
                            sx={{ display: 'inline-block' }}
                            width={32}
                          />
                          <Diff val={0} reverse />
                        </NumberCell>
                        <NumberCell>
                          <Skeleton
                            variant="text"
                            sx={{ display: 'inline-block' }}
                            width={32}
                          />
                        </NumberCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Skeleton
                              variant="circular"
                              sx={{ display: 'inline-block' }}
                              width={26}
                              height={26}
                            />
                            <Skeleton
                              variant="text"
                              sx={{ display: 'inline-block', flex: 1 }}
                              height={26}
                            />
                          </Stack>
                        </TableCell>
                        <NumberCell>
                          <Skeleton
                            variant="text"
                            sx={{ display: 'inline-block' }}
                            width={32}
                          />
                          <Diff val={0} suffix="%" />
                        </NumberCell>
                        <NumberCell sx={{ color: 'gray' }} align="right">
                          <Skeleton
                            variant="text"
                            sx={{ display: 'inline-block' }}
                            width={32}
                          />
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
