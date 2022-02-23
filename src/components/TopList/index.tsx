import * as React from "react";
import {useRank} from "../../api/query";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import {useRepo} from "../../api/gh";
import {Owner} from "../github";
import ThemeAdaptor from "../ThemeAdaptor";

export default function TopList() {
  const {data: ranks, isValidating: loading} = useRank(20)

  if (loading) {
    return (
      <Box>
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
      </Box>
    )
  }

  return (
    <ThemeAdaptor>
      <TableContainer component='div' sx={{}}>
        <Table sx={{minWidth: 650, marginBottom: 0}} aria-label="simple table" size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell align="right">Stars</TableCell>
              <TableCell align="right">Forks</TableCell>
              <TableCell align="right">Watches</TableCell>
              <TableCell align="right">Issues</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {ranks.map((row) => (
              <TableRow
                key={row.repo_name}
              >
                <TableCell component="th" scope="row">
                  <a href={`https://github.com/${row.repo_name}`} target='_blank'>
                    {row.repo_name.split('/')[1]}
                  </a>
                </TableCell>
                <RepoExtraInfo repoName={row.repo_name} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ThemeAdaptor>
  );
}

const RepoExtraInfo = ({repoName}) => {
  const {data: repo, isValidating: loading} = useRepo(repoName)

  if (loading) {
    return (
      <TableCell colSpan={5} align="center">
        <Skeleton animation="wave" />
      </TableCell>
    )
  } else {
    return (
      <>
        <TableCell>
          <Owner owner={repo.owner} />
        </TableCell>
        <TableCell align="right">
          {repo.watchers}
        </TableCell>
        <TableCell align="right">
          {repo.forks}
        </TableCell>
        <TableCell align="right">
          {repo.subscribers_count}
        </TableCell>
        <TableCell align="right">
          {repo.open_issues}
        </TableCell>
      </>
    )
  }
}