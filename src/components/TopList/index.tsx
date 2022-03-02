import * as React from "react";
import {useRank} from "../../api/query";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Link from '@mui/material/Link';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from '@mui/material/Tooltip';
import Skeleton from "@mui/material/Skeleton";
import {Owner} from "../github";
import ThemeAdaptor from "../ThemeAdaptor";
import {data} from "./config";
import styles from './index.module.css'
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import InfoIcon from "@mui/icons-material/Info";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import CodeBlock from "@theme/CodeBlock";


export default function TopList() {
  const {data: ranks, isValidating: loading} = useRank()
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
      <h2>
        These are the 20 most active repositories within the <u>last hour</u>.
        <Tooltip
          title={(
            <Typography variant='body2'>
              Query was filtered due to massive bots' commits.
              <br />
              <Button disabled={loading} onClick={handleOpen}>SHOW SQL</Button>
            </Typography>
          )}
        >
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </h2>
      <TableContainer component={Paper}>
        <Table sx={{minWidth: 650, marginBottom: 0}} aria-label="simple table" size='small'
               className={styles.clearTable}>
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <b>#</b>
              </TableCell>
              <TableCell>Repo</TableCell>
              {(data || []).map(({title, headline, tooltip, key}) => (
                <TableCell key={key} align="center">
                  <Tooltip title={(
                    <Box sx={{padding: 1}}>
                      <Link
                        variant='subtitle1'
                        href={headline.url}
                        target='_blank'
                      >
                        {headline.content}
                      </Link>
                      <Divider sx={{my: 1}} />
                      <Typography variant='body2' component='p'>
                        {tooltip}
                      </Typography>
                    </Box>
                  )}>
                    <span>
                      {title}
                    </span>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {ranks.map(({repo_name, ...counts}, i) => {
              const [owner, repo] = repo_name.split('/')

              return (
                <TableRow
                  key={repo_name}
                >
                  <TableCell component="th" scope="row" align='center'>
                    {i + 1}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                      <Owner owner={owner} />
                      <span>/</span>
                      <Typography component='a' href={`https://github.com/${repo_name}`} target='_blank'>
                        {repo}
                      </Typography>
                    </Stack>
                  </TableCell>
                  {data.map(({key}) => (
                    <TableCell key={key} align="center">
                      <Typography variant='body2' component='span' color={counts[key] === 0 ? 'text.disabled' : undefined}>
                        {counts[key] || '--'}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        maxWidth="960px"
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <DialogTitle>
          [For Debug] SQL Execution info
        </DialogTitle>
        <Box sx={{p: 4}}>
          {renderCodes(ranks?.sql)}
        </Box>
      </Dialog>
    </ThemeAdaptor>
  );
}

const renderCodes = sql => {
  let content = undefined
  if (!sql) {
    content = (
      <Box sx={{pt: 0.5}}>
        <Skeleton width="80%" />
        <Skeleton width="50%" />
        <Skeleton width="70%" />
      </Box>
    )
  } else {
    content = (
      <CodeBlock className='language-sql'>
        {sql}
      </CodeBlock>
    )
  }
  return content
}
