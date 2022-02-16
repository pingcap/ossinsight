import React, {useEffect, useMemo, useState} from "react";
import {QueryRenderer} from '@cubejs-client/react';
import cubejs from '@cubejs-client/core';
import Stack from '@mui/material/Stack';
import Paper from "@mui/material/Paper";
import TextField from '@mui/material/TextField';
import Divider from "@mui/material/Divider";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import DatePicker from '@mui/lab/DatePicker';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThemeProvider from "@mui/system/ThemeProvider";
import {createTheme} from "@mui/material";
import {DateTime} from 'luxon'
import {LocalizationProvider} from "@mui/lab";
import DateAdapter from '@mui/lab/AdapterLuxon';
import Head from '@docusaurus/Head';
import useThemeContext from '@theme/hooks/useThemeContext';
import CodeBlock from '@theme/CodeBlock';
import {useDeepCompareMemo} from 'use-deep-compare'
import {Bar} from 'react-chartjs-2';
import {BarElement, CategoryScale, Chart, LinearScale, Tooltip, Legend} from 'chart.js';
import { format } from 'sql-formatter';


Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const cubejsApi = cubejs('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NDQ4OTYyNDMsImV4cCI6MTY0NDk4MjY0M30.2XanIk0exgEmFwsHX0w_w9LWk-X4PaVfPIX235z9JsM', {
  apiUrl: 'https://community-preview-tug.tidb.io/cubejs-api/v1'
});

const minDate = DateTime.fromObject({year: 2011})
const maxDate = DateTime.now()

const renderDateInput = (params) => <TextField {...params} helperText={null} variant="standard" />

const types = [
  {title: 'Stars', value: "WatchEvent"},
  {title: 'Forks', value: 'ForkEvent'},
  {title: 'PRs', value: 'PullRequestEvent'}
]

const dbs = [
  {title: 'All', value: 'GithubEvents.repoName'},
  {title: 'CN', value: 'CnRepos.name'},
  {title: 'Database', value: 'DbRepos.name'},
]

const useForm = () => {

  const random = useMemo(() => Math.random(), [])

  const [type, setType] = useState(types[0].value)
  const [db, setDb] = useState(dbs[0].value)
  const [from, setFrom] = useState(minDate)
  const [to, setTo] = useState(maxDate)
  const [sql, setSql] = useState('')
  const [sqlErr, setSqlErr] = useState(undefined)

  const query = useMemo(() => {
    const segments = []
    const dimensions = []
    const filters = []

    filters.push({"member": `GithubEvents.eventMonth`, "operator": "gte", "values": [from.toFormat('yyyy-MM-01')]})
    filters.push({"member": `GithubEvents.eventMonth`, "operator": "lte", "values": [to.toFormat('yyyy-MM-01')]})
    if (db) {
      dimensions.push(`${db}`)
      filters.push({"member": `${db}`, "operator": "set"})
    } else {
      dimensions.push(`GithubEvents.repoName`)
    }
    filters.push({
      'member': 'GithubEvents.type',
      'operator': 'equals',
      "values": [
        type
      ]
    })
    return {
      "measures": ["GithubEvents.count"],
      "timeDimensions": [],
      "order": [["GithubEvents.count", "desc"]],
      "limit": 10,
      segments,
      dimensions,
      filters
    }
  }, [type, db, from, to])

  const pivotConfig = useMemo(() => {
    return {
      "x": [
        `${db}`
      ],
      "y": [
        "measures"
      ],
      "fillMissingDates": true,
      "joinDateRange": false
    }
  }, [db])

  useEffect(() => {
    setSql('')
    setSqlErr(undefined)
    cubejsApi.sql(query)
      .then(res => {
        const [sql, params] = res.rawQuery().sql
        setSql(format(sql, { language: "mysql", params: params.map(val => `'${val}'`) }))
      })
      .catch(error => {
        setSql('')
        setSqlErr(error)
      })
  }, [query])

  const form = (
    <Stack direction='row' sx={{flexWrap: 'wrap', gap: 4}}>
      <FormControl variant="standard" sx={{minWidth: '120px', maxWidth: '120px'}}>
        <InputLabel id={`cubechart-${random}-type`}>Type</InputLabel>
        <Select
          id={`cubechart-${random}-type`}
          value={type}
          onChange={e => setType(e.target.value)}
          label="Type"
          size='small'
        >
          {types.map(type => <MenuItem key={type.value} value={type.value}>{type.title}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{minWidth: '120px', maxWidth: '120px'}}>
        <InputLabel id={`cubechart-${random}-db`}>DB</InputLabel>
        <Select
          id={`cubechart-${random}-db`}
          value={db}
          onChange={e => setDb(e.target.value)}
          label="DB"
          size='small'
        >
          {dbs.map(db => <MenuItem key={db.value} value={db.value}>{db.title}</MenuItem>)}
        </Select>
      </FormControl>
      <DatePicker
        label='From year'
        views={['year', 'month']}
        minDate={minDate}
        maxDate={maxDate}
        value={from}
        onChange={setFrom}
        renderInput={renderDateInput}
        size='small'
        sx={{minWidth: '260px', maxWidth: '260px'}}
      />
      <DatePicker
        label='To year'
        views={['year', 'month']}
        minDate={minDate}
        maxDate={maxDate}
        value={to}
        onChange={setTo}
        renderInput={renderDateInput}
        size='small'
        sx={{minWidth: '260px', maxWidth: '260px'}}
      />
    </Stack>
  )

  return {form, query, pivotConfig, sql, sqlErr}
}

export default function CubeChart() {
  const {form, query, pivotConfig, sql} = useForm()
  const {isDarkTheme} = useThemeContext();
  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? 'dark' : undefined,
    },
  });

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <ThemeProvider theme={theme}>
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
        </Head>
        <Paper elevation={1} sx={{padding: 2}}>
          {form}
          <Divider sx={{my: 2}} />
          <QueryRenderer
            loadSql={false}
            query={query}
            cubejsApi={cubejsApi}
            render={(props) => {
              return (
                <>
                  {renderCodes(sql)}
                  <div style={{height: 400}}>
                    {renderChart({...props, pivotConfig})}
                  </div>
                </>
              )
            }}
          />
        </Paper>
      </ThemeProvider>
    </LocalizationProvider>
  )
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
  return (
    <>
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary disabled={!sql} expandIcon={<ExpandMoreIcon />}>
          <Typography>SQL</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {content}
        </AccordionDetails>
      </Accordion>
    </>
  )
}

const COLORS_SERIES = [
  'rgb(37, 193, 159)',
  '#5b8ff9',
  '#5e7092',
  '#f6bd18',
  '#6f5efa',
  '#6ec8ec',
  '#945fb9',
  '#ff9845',
  '#299796',
  '#fe99c3',
];
const PALE_COLORS_SERIES = [
  '#d7e3fd',
  '#daf5e9',
  '#d6dbe4',
  '#fdeecd',
  '#dad8fe',
  '#dbf1fa',
  '#e4d7ed',
  '#ffe5d2',
  '#cce5e4',
  '#ffe6f0',
];
const commonOptions = {
  maintainAspectRatio: false,
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    x: {
      ticks: {
        autoSkip: false,
        maxRotation: 180,
        padding: 0,
        minRotation: 0,
      },
    },
  },
};

const BarChartRenderer = ({resultSet, pivotConfig}) => {
  const datasets = useDeepCompareMemo(
    () =>
      resultSet.series().map((s, index) => ({
        label: s.title,
        data: s.series.map((r) => r.value),
        yValues: [s.key],
        backgroundColor: COLORS_SERIES[index],
        fill: false,
      })),
    [resultSet]
  );
  const data = {
    labels: resultSet.categories().map((c) => c.x),
    datasets,
  };
  const stacked = !(pivotConfig.x || []).includes('measures');
  const options = {
    ...commonOptions,
    scales: {
      x: {...commonOptions.scales.x, stacked},
      y: {...commonOptions.scales.y, stacked},
    },
  };
  return (
    <Bar
      height='400'
      type="bar"
      data={data}
      options={options}
    />
  );
};

const renderChart = ({resultSet, error, pivotConfig}) => {
  if (error) {
    return <div dangerouslySetInnerHTML={{__html: error.toString()}} />;
  }

  if (!resultSet) {
    return <Skeleton variant="rectangular" height={218} />
  }

  return <BarChartRenderer resultSet={resultSet} pivotConfig={pivotConfig} />;
};