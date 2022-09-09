import type { ProcessedTopListData } from './hook';
import { useLanguages, useOrderBy, usePeriods, useTopList } from "./hook";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Skeleton from "@mui/material/Skeleton";
import React from "react";
import Link from "@docusaurus/Link";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { Chip } from "@mui/material";
import { useHistory } from '@docusaurus/router';
import type { History } from 'history';
import { paramCase } from "param-case";
import Box from "@mui/material/Box";
import { useDebugDialog } from "../../../../components/DebugDialog";
import TableContainer from "@mui/material/TableContainer";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

export function TopListV2() {
  const { select: periodSelect, value: period } = usePeriods();
  const { select: languageSelect, value: language } = useLanguages();
  const { select: orderBySelect, value: orderBy } = useOrderBy()
  const { data, loading, error } = useTopList(language.key, period.key, orderBy as any);
  const { dialog: debugDialog, button: debugButton } = useDebugDialog(data);

  return (
    <Box>
      <Stack direction="row" justifyContent="start" alignItems="center" flexWrap="wrap">
        {periodSelect}
        <Box mx={0.5}/>
        <span>
          Lang:&nbsp;
        </span>
        {languageSelect}
        <Divider orientation='vertical' flexItem sx={{ ml: 0.5, mr: 1, bgcolor: 'rgba(255,255,255,.4)', width: 2 }} />
        {orderBySelect}
        {debugButton}
      </Stack>
      <DataTable data={data?.data} loading={loading} />
      <Typography variant='body2'>
        <Link href='/blog/why-we-choose-tidb-to-support-ossinsight' target='_blank'>
          🤖️ How do we display these rankings?
        </Link>
      </Typography>
      {debugDialog}
    </Box>
  );
}


const DataTable = ({ data, loading }: { data: ProcessedTopListData[], loading: boolean }) => {
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
              backgroundColor: theme.palette.action.hover,
            },
          })}
        >
          {data ? renderData(data, history) : renderLoading()}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const RepoName = styled('span')({
  fontSize: 18,
  fontWeight: 'bold',
})

const RepoDescription = styled('p')({
  fontSize: 14,
  color: '#7d7d7d',
  margin: 0,
  marginTop: 8,
  maxWidth: 600,
})

const RepoMeta = styled('div')({
  fontSize: 12,
  color: '#7d7d7d',
  margin: 0,
  marginTop: 8,
  maxWidth: 600,
})

const renderData = (data: ProcessedTopListData[], history: History) => {
  return data.map((item, i) => (
    <TableRow key={item.repo_id}>
      <TableCell component="th">#{i + 1}</TableCell>
      <TableCell>
        <RepoName>
          <Link href={`/analyze/${item.repo_name}`} target='_blank'>{item.repo_name}</Link>
        </RepoName>
        {renderCollections(item.collection_names, history)}
        <RepoDescription>
          {item.description}
        </RepoDescription>
        <RepoMeta>
          {item.language}
        </RepoMeta>
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
        <Skeleton variant='circular' sx={{ display: 'inline-block', width: 16, height: 16 }} />
        <Skeleton variant='circular' sx={{ display: 'inline-block', width: 16, height: 16, ml: 1 }} />
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
        <Link key={login} href={`/analyze/${login}`} target='_blank'>
          <Avatar sx={{ width: 22, height: 22 }} src={`https://github.com/${login}.png`} />
        </Link>
      ))}
    </Stack>
  );
};
