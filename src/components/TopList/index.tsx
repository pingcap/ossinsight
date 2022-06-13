import * as React from "react";
import {useCallback} from "react";
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
import InfoIcon from "@mui/icons-material/Info";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import {renderCodes} from "../BasicCharts";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {groups} from "../GroupSelect/groups";

interface TopListProps {
  period: string
  onPeriodChange: (period: string) => void
}

const periods: { name: string, value: string }[] = [
  { name: 'last hour', value: 'last_hour' },
  { name: 'last day', value: 'last_day' },
  { name: 'last week', value: 'last_week' },
  { name: 'last month', value: 'last_month' }
]

export default function TopList({period, onPeriodChange}: TopListProps) {
  const {data: ranks, isValidating: loading} = useRank(period)
  const [open, setOpen] = React.useState(false);
  const handleOpen = useCallback(() => setOpen(true), [setOpen]);
  const handleClose = useCallback(() => setOpen(false), [setOpen]);
  const handlePeriodChange = useCallback((event: SelectChangeEvent) => onPeriodChange(event.target.value), [onPeriodChange])

  return (
    <ThemeAdaptor>
      {renderTopListHeader(period, handlePeriodChange, loading, handleOpen)}
      {renderTopListBody(ranks, loading)}
      <Dialog
        maxWidth="lg"
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

function renderTopListHeader (period: string, handlePeriodChange: (period: SelectChangeEvent)=>void, loading: boolean, handleOpen: () => void) {
  return (
    <Typography component='h2' variant='h2' sx={{ mb: 2, fontSize: 36 }} align='center'>
      Top 20 most active repositories in
      &nbsp;
      <Select<string>
        autoWidth
        value={period}
        variant='standard'
        onChange={handlePeriodChange}
        placeholder='Select...'
        sx={{ font: 'inherit', color: 'primary.main', lineHeight: 'inherit' }}
        disableUnderline
      >
        {periods.map(({name, value}) => (
          <MenuItem key={value} value={value}>{name}</MenuItem>
        ))}
      </Select>
      <Tooltip
        title={(
          <Typography variant='body2'>
            Query was filtered due to massive bots' commits.
            <br />
            <Button disabled={loading} onClick={handleOpen}>SHOW SQL</Button>
          </Typography>
        )}
        disableFocusListener
      >
        <IconButton>
          <InfoIcon />
        </IconButton>
      </Tooltip>
    </Typography>
  )
}

function renderTopListBody (ranks: ReturnType<typeof useRank>['data'], loading: boolean) {
  const head = (
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
  )

  const body = (
    <TableBody>
      {ranks?.map(({repo_name, ...counts}, i) => {
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
  )

  const loader = (
    <TableBody>
      <TableRow>
        <TableCell colSpan={data.length + 2}>
          <Skeleton animation="wave" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={data.length + 2}>
          <Skeleton animation="wave" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={data.length + 2}>
          <Skeleton animation="wave" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={data.length + 2}>
          <Skeleton animation="wave" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={data.length + 2}>
          <Skeleton animation="wave" />
        </TableCell>
      </TableRow>
    </TableBody>
  )

  return (
    <TableContainer component={Paper}>
      <Table sx={{minWidth: 650, marginBottom: 0}} aria-label="simple table" size='small'
             className={styles.clearTable}>
        {head}
        {loading ? loader : body }
      </Table>
    </TableContainer>
  )
}
