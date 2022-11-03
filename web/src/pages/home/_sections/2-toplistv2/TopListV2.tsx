import type { ProcessedTopListData } from './hook';
import { useLanguages, usePagination, usePeriods, useTopList } from './hook';
import React from 'react';
import Link from '@docusaurus/Link';
import {
  Chip,
  TablePagination,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Avatar,
  Stack,
  Box,
  TableContainer,
  Typography,
  styled,
} from '@mui/material';
import { useHistory } from '@docusaurus/router';
import type { History } from 'history';
import { paramCase } from 'param-case';
import { useDebugDialog } from '@site/src/components/DebugDialog';
import LANGUAGE_COLORS from './language-colors.json';
import { LinkExternalIcon } from '@primer/octicons-react';
import { notNullish } from '@site/src/utils/value';

for (const lang in LANGUAGE_COLORS) {
  LANGUAGE_COLORS[lang.toLowerCase()] = LANGUAGE_COLORS[lang];
}

export function TopListV2 () {
  const { select: periodSelect, value: period } = usePeriods();
  const { select: languageSelect, value: language } = useLanguages();
  // const { select: orderBySelect, value: orderBy } = useOrderBy();
  const { data, loading } = useTopList(language, period.key, 'total_score');
  const { dialog: debugDialog, button: debugButton } = useDebugDialog(data);

  const { page, rowsPerPage, list, handleChangePage, handleChangeRowsPerPage } = usePagination(data, [period.key, language]);

  return (
    <Box>
      <Stack direction="row" justifyContent="start" alignItems="center" flexWrap="wrap">
        {periodSelect}
        <Box mx={0.5} />
        <span>
          Language&nbsp;:&nbsp;&nbsp;&nbsp;
        </span>
        {languageSelect}
        {/* <Divider orientation="vertical" flexItem sx={{ ml: 0.5, mr: 1, bgcolor: 'rgba(255,255,255,.4)', width: 2 }} /> */}
        {/* {orderBySelect} */}
        {debugButton}
      </Stack>
      <TablePagination
        sx={{
          '.MuiTablePagination-spacer': {
            display: 'none',
          },
          '.MuiToolbar-root': {
            padding: 0,
            '& > p': {
              margin: '0 !important',
            },
          },
        }}
        size="small"
        rowsPerPageOptions={[20, 50, 100]}
        component="div"
        count={data?.data.length ?? 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <DataTable data={list} loading={loading} rowsPerPage={rowsPerPage} page={page} />
      <Typography variant="body2">
        <Link href="/blog/why-we-choose-tidb-to-support-ossinsight" target="_blank">
          🤖️ How do we display these rankings?
        </Link>
      </Typography>
      {debugDialog}
    </Box>
  );
}

const DataTable = ({ data, loading, page, rowsPerPage }: { data: ProcessedTopListData[] | undefined, loading: boolean, page: number, rowsPerPage: number }) => {
  const history = useHistory();

  return (
    <TableContainer>
      <Table className="clearTable">
        <TableHead>
          <TableRow>
            <TableCell variant="head">Rank</TableCell>
            <TableCell variant="head">Repository</TableCell>
            <TableCell variant="head">Stars</TableCell>
            <TableCell variant="head">Forks</TableCell>
            <TableCell variant="head">Pushes</TableCell>
            <TableCell variant="head">PRs</TableCell>
            <TableCell variant="head">Top Contributors</TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          sx={theme => ({
            '.MuiTableRow-root:nth-of-type(odd)': {
              // backgroundColor: theme.palette.action.hover,
            },
          })}
        >
          {notNullish(data) ? renderData(data, page * rowsPerPage, history) : renderLoading()}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const RepoName = styled('span')({
  fontSize: 18,
  fontWeight: 'bold',
});

const RepoDescription = styled('p')({
  fontSize: 14,
  color: '#adadad',
  margin: 0,
  marginTop: 8,
  maxWidth: 600,
});

const RepoMeta = styled('div')({
  fontSize: 14,
  color: '#7d7d7d',
  margin: 0,
  marginTop: 8,
  maxWidth: 600,
  display: 'inline-flex',
  alignItems: 'center',
});

const Dot = styled('span')({
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  marginRight: 4,
  verticalAlign: 'middle',
});

const ExternalLink = styled('a')({
  marginLeft: 4,
  color: '#7c7c7c',
});

const renderData = (data: ProcessedTopListData[], offset: number, history: History) => {
  return data.map((item, i) => (
    <TableRow key={item.repo_id}>
      <TableCell component="th">#{i + 1 + offset}</TableCell>
      <TableCell>
        <RepoName>
          <Link href={`/analyze/${item.repo_name}`} target="_blank">{item.repo_name}</Link>
          <ExternalLink href={`https://github.com/${item.repo_name}`} target="_blank">
            <LinkExternalIcon size={16} verticalAlign="middle" />
          </ExternalLink>
        </RepoName>
        {renderCollections(item.collection_names, history)}
        <RepoDescription>
          {item.description}
        </RepoDescription>
        {item.language && (
          <RepoMeta>
            <Dot sx={{ backgroundColor: LANGUAGE_COLORS[item.language?.toLowerCase()] ?? '#d1d1d1' }} />
            {item.language}
          </RepoMeta>
        )}
      </TableCell>
      <TableCell>{item.stars ?? 0}</TableCell>
      <TableCell>{item.forks ?? 0}</TableCell>
      <TableCell>{item.pushes ?? 0}</TableCell>
      <TableCell>{item.pull_requests ?? 0}</TableCell>
      <TableCell>{renderContributors(item.contributor_logins)}</TableCell>
    </TableRow>
  ));
};

const renderLoading = () => {
  return [0, 1, 2, 3, 4, 5].map((item, i) => (
    <TableRow key={item}>
      <TableCell component="th"><Skeleton sx={{ display: 'inline-block', width: 16 }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block', width: 32 }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block', width: 32 }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block', width: 32 }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block', width: 32 }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block', width: 32 }} /></TableCell>
      <TableCell>
        <Skeleton variant="circular" sx={{ display: 'inline-block', width: 16, height: 16 }} />
        <Skeleton variant="circular" sx={{ display: 'inline-block', width: 16, height: 16, ml: 1 }} />
      </TableCell>
    </TableRow>
  ));
};

const renderCollections = (names: string[] | undefined | null, history: History) => {
  return (
    <Stack direction="row" gap={1} display="inline-flex" ml={1}>
      {names?.map(collection => (
        <Chip key={collection} size="small" label={collection}
              onClick={() => history.push(`/collections/${paramCase(collection)}`)} />
      ))}
    </Stack>
  );
};

const renderContributors = (names: string[] | undefined | null) => {
  return (
    <Stack direction="row" gap={1}>
      {names?.map(login => (
        <Link key={login} href={`/analyze/${login}`} target="_blank">
          <Avatar sx={{ width: 22, height: 22 }} src={`https://github.com/${login}.png`} />
        </Link>
      ))}
    </Stack>
  );
};
