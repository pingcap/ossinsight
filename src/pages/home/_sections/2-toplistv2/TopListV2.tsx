import type { ProcessedTopListData } from './hook';
import { useLanguages, usePeriods, useTopList } from "./hook";
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

export function TopListV2() {
  const { select: periodSelect, value: period } = usePeriods();
  const { select: languageSelect, value: language } = useLanguages();
  const { data, loading, error } = useTopList(language, period.key);
  const { dialog: debugDialog, button: debugButton } = useDebugDialog(data);

  return (
    <Box>
      <Stack direction="row" justifyContent="start" alignItems="center" flexWrap="wrap">
        {/* <span>
          TimeRange:&nbsp;
        </span> */}
        {periodSelect}
        <Divider orientation="vertical" flexItem sx={{ mr: 1 }} />
        <span>
          Language:&nbsp;
        </span>
        {languageSelect}
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
            <TableCell variant="head">Pushes</TableCell>
            <TableCell variant="head">Pull Requests</TableCell>
            <TableCell variant="head">All Events</TableCell>
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

const renderData = (data: ProcessedTopListData[], history: History) => {
  return data.map((item, i) => (
    <TableRow key={item.repo_id}>
      <TableCell component="th">#{i + 1}</TableCell>
      <TableCell>
        <Link href={`/analyze/${item.repo_name}`} target='_blank'>{item.repo_name}</Link>
        {renderCollections(item.collection_names, history)}
      </TableCell>
      <TableCell>{item.stars}</TableCell>
      <TableCell>{item.pushes}</TableCell>
      <TableCell>{item.pull_requests}</TableCell>
      <TableCell>{item.events}</TableCell>
      <TableCell>{renderContributors(item.contributor_logins)}</TableCell>
    </TableRow>
  ));
};

const renderLoading = () => {
  return [0, 1, 2, 3, 4, 5].map((item, i) => (
    <TableRow key={item}>
      <TableCell component="th"><Skeleton sx={{ display: 'inline-block' }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block' }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block' }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block' }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block' }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block' }} /></TableCell>
      <TableCell><Skeleton sx={{ display: 'inline-block' }} /></TableCell>
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
