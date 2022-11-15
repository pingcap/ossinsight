import * as React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';
import { format } from 'sql-formatter';
import LoadingButton from '@mui/lab/LoadingButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TerminalIcon from '@mui/icons-material/Terminal';

import { useSQLPlayground } from '../../../components/RemoteCharts/hook';
import { Repo } from '../../../components/CompareHeader/RepoSelector';
import { isFiniteNumber, isNullish, notFalsy, notNullish } from '@site/src/utils/value';

import {
  Stack,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Typography,
  Button,
  IconButton,
} from '@mui/material';

const renderTable = (data: Array<{ [x: string]: string | number }>) => {
  return (
    <>
      <TableContainer component={Paper}>
        <Table
          sx={{ minWidth: 650, marginBottom: 0 }}
          aria-label="data table"
          size="small"
        >
          <TableHead>
            <TableRow>
              {notNullish(data[0]) &&
                Object.keys(data[0]).map((key) => (
                  <TableCell
                    key={`th=${key}`}
                    sx={{
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {key}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, idx) => {
              return (
                <TableRow
                  key={`row-${idx}`}
                  // sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  {Object.keys(row).map((key, idx) => {
                    if (idx === 0) {
                      return (
                        <TableCell
                          key={key}
                          component="th"
                          scope="row"
                          sx={{
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {`${row[key]}`}
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell
                        key={key}
                        sx={{
                          whiteSpace: 'nowrap',
                        }}
                      >{`${row[key]}`}</TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export const SQLPlaygroundDrawer = (props: { data?: Repo }) => {
  const { data: targetData } = props;

  const [inputValue, setInputValue] = React.useState('');
  const [sql, setSQL] = React.useState('');
  const [open, setOpen] = React.useState(false);

  // const { repoId, repoName, comparingRepoId } = useAnalyzeContext();

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setOpen(open);
    };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toUpperCase() === 'K' && (event.ctrlKey || event.metaKey)) {
        // it was Ctrl + K (Cmd + K)
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const onChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const { data, loading, error } = useSQLPlayground(
    sql,
    'repo',
    `${targetData?.id ?? 'undefined'}`,
  );

  // React.useEffect(() => {
  //   if (data?.sql) {
  //     const formattedSQL = format(data.sql, {
  //       language: "mysql",
  //       uppercase: true,
  //       linesBetweenQueries: 2,
  //     });
  //     setInputValue(formattedSQL);
  //   }
  // }, [data]);

  const handleFormatSQLClick = () => {
    const formattedSQL = format(inputValue, {
      language: 'mysql',
      uppercase: true,
      linesBetweenQueries: 2,
    });
    setInputValue(formattedSQL);
  };

  const handleSubmit = () => {
    setSQL(inputValue);
  };

  const handlePredefinedSQLChange = (targetSQL: string) => {
    setInputValue(targetSQL);
  };

  const handleClickTerminalBtn = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(true);
  };

  return <>
    <IconButton
      aria-label="Ppen SQL Playground"
      onClick={handleClickTerminalBtn}
      sx={{
        display: {
          xs: 'none',
          // Remove next line to show terminal button on desktop
          md: 'inline-flex',
        },
      }}
    >
      <TerminalIcon />
    </IconButton>
    <Drawer
      anchor="bottom"
      open={open}
      onClose={toggleDrawer(false)}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <Box
        id="sql-playground-container"
        sx={{
          height: '80vh',
          overflow: 'hidden',
          width: '100%',
          padding: '1rem',
          borderTop: '0.5px solid grey',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            padding: '0 1rem 1rem 1rem',
            alignItems: 'center',
          }}
        >
          <Typography variant="h2" component="div" sx={{ flexGrow: 1, color: 'orange' }}>
            Playground: Based on Row-Oriented Storage Engine
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '1rem',
              marginLeft: 'auto',
            }}
          >
            <Button
              variant="contained"
              size="small"
              disabled={!inputValue || isNullish(targetData?.id)}
              onClick={handleFormatSQLClick}
            >
              Format
            </Button>
            <LoadingButton
              variant="contained"
              size="small"
              disabled={!inputValue || isNullish(targetData?.id)}
              onClick={handleSubmit}
              endIcon={<PlayArrowIcon fontSize="inherit" />}
              loading={loading}
            >
              Run
            </LoadingButton>
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            marginBottom: '1rem',
            height: '100%',
            maxHeight: 'calc(100% - 3.5rem)',
          }}
        >
          <Box
            id="playground-left"
            sx={{
              height: '100%',
              overflowY: 'auto',
              width: '40%',
              maxWidth: '40vw',
            }}
          >
            <PreDefinedSQLList
              hadnleClick={handlePredefinedSQLChange}
              replacements={[
                { match: 'repoId', value: `${targetData?.id ?? 'undefined'}` },
                { match: 'repoName', value: targetData?.name ?? 'undefined' },
              ]}
            />
          </Box>
          <Box
            id="playground-right"
            sx={{
              height: '100%',
              overflowY: 'auto',
              width: '100%',
              padding: '0 1rem',
            }}
          >
            <SQLEditor
              mode="sql"
              theme="twilight"
              onChange={onChange}
              name="SQL_PLAYGROUND"
              width="100%"
              height={data?.data ? '250px' : '350px'}
              showPrintMargin={false}
              value={
                inputValue ||
                `
/* ⚠️ 
Playground uses LIMITED resource(cpu/mem), so SQL should add:

WHERE repo_id = ${targetData?.id ?? 'undefined'}

to use index as much as possible, or it will be terminated.


Example:

SELECT
*
FROM
github_events
WHERE
repo_id = ${targetData?.id ?? '{{repoId}}'}
LIMIT
1;
*/
`
              }
              fontSize={16}
              setOptions={{
                enableLiveAutocompletion: true,
              }}
            />

            {notFalsy(error) && (
              <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                {`${error}`}
              </Alert>
            )}
            {isFiniteNumber(data?.spent) && notNullish(data) && (
              <>
                <Typography variant="body2" sx={{ padding: '1rem' }}>
                  {`${data.data.length} results in ${data.spent.toFixed(
                    2,
                  )}s.`}
                </Typography>
              </>
            )}
            {data?.data && (
              <Box>
                {notNullish((data?.sql?.match(/\bEXPLAIN\b/i)))
                  ? (
                  <CodeBlock>{dataListToRawOutput(data.data)}</CodeBlock>
                    )
                  : (
                      renderTable(data.data)
                    )}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    </Drawer>
  </>;
};

const PreDefinedSQLList = (props: {
  title?: string;
  hadnleClick: (sql: string) => void;
  replacements?: Array<{ match: string, value: string }>; // Replace the string `{{match}}` with `value` in SQL
}) => {
  const {
    // title = 'Pre-defined SQL',
    hadnleClick = () => {},
    replacements = [],
  } = props;

  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(
    null,
  );

  const SQLListSubHeader = (props: { title: string }) => {
    const { title } = props;
    return (
      <ListSubheader
        sx={{
          '&:not(:first-of-type)': {
            marginTop: '0.5rem',
          },
          marginBottom: '0.5rem',
          backgroundColor: 'transparent',
          color: '#5DADF2',
          position: 'unset',
        }}
      >
        <Typography variant="h4" component="div">
          {title}
        </Typography>
      </ListSubheader>
    );
  };

  return (
    <Box>
      <List
        sx={{
          padding: 0,
        }}
      >
        {PREDEFINED_SQL_LIST.map((item) => {
          if (item.type === 'header') {
            return <SQLListSubHeader key={item.id} title={item.title} />;
          }

          let sql = item.sql;

          replacements.forEach((replacement) => {
            sql = sql?.replaceAll(`{{${replacement.match}}}`, replacement.value);
          });

          return (
            <ListItem disablePadding key={item.id}>
              <ListItemButton
                selected={selectedItemId === item.id}
                onClick={() => {
                  if (selectedItemId !== item.id) {
                    hadnleClick(sql ?? '');
                    setSelectedItemId(item.id);
                  }
                }}
              >
                <ListItemText
                  primary={item.title}
                  sx={{
                    paddingLeft: '1rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

type PREDEFINED_SQL_ITEM_TYPE = {
  id: string;
  title: string;
  type: 'header' | 'sql';
  sql?: string;
};

// Support variables in SQL: use {{<your variable>}}
const PREDEFINED_SQL_LIST: PREDEFINED_SQL_ITEM_TYPE[] = [
  {
    id: 'table_info',
    title: 'Learn about table info ↓',
    type: 'header',
  },
  {
    id: 'table_schema',
    type: 'sql',
    title: 'Show table schema',
    sql: 'DESC github_events;',
  },
  {
    id: 'table_indexes',
    type: 'sql',
    title: 'Show table indexes',
    sql: `SHOW indexes
FROM
  github_events;`,
  },
  {
    id: 'example_row',
    type: 'sql',
    title: 'This is an example row',
    sql: `SELECT
  *
FROM
  github_events
WHERE
  repo_id = {{repoId}}
LIMIT
  1`,
  },
  {
    id: 'total_rows',
    type: 'sql',
    title: 'Total rows of this repo - Realtime',
    sql: `-- Delayed by 5 minutes: https://github.blog/changelog/2018-08-01-new-delay-public-events-api/
SELECT
  COUNT(*)
FROM
  github_events
WHERE
  -- repo_name = '{{repoName}}' -- try use this and find out the difference
  repo_id = {{repoId}}`,
  },
  {
    id: 'this_repo',
    title: 'Learn about this repo ↓',
    type: 'header',
  },
  {
    id: 'first_pr',
    type: 'sql',
    title: 'Who created the first pull request of this repo?',
    sql: `SELECT
  *
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND type = 'PullRequestEvent'
ORDER BY
  created_at ASC
LIMIT
  1
;`,
  },
  {
    id: 'first_issue',
    type: 'sql',
    title: 'Who closed the first issue?',
    sql: `SELECT
  *
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND type = 'IssuesEvent'
  AND action = 'closed'
ORDER BY
  created_at ASC
LIMIT
  1`,
  },
  {
    id: 'latest_stargazer',
    type: 'sql',
    title: 'Who is the latest stargazer?',
    sql: `SELECT
  *
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND type = 'WatchEvent'
ORDER BY
  created_at DESC -- Try to use ASC to get the first stargazer
LIMIT
  1
;`,
  },
  {
    id: 'active_reviewer',
    type: 'sql',
    title: 'Who reviewed the most of code?',
    sql: `SELECT
  actor_login,
  COUNT(*) AS comments
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND actor_login NOT LIKE '%bot%'
  AND type IN (
    'IssueCommentEvent',
    'PullRequestReviewEvent',
    'PullRequestReviewCommentEvent'
  )
GROUP BY
  actor_login
ORDER BY
  comments DESC
LIMIT
  5
;`,
  },
  {
    id: 'most_loc_added',
    type: 'sql',
    title: 'Who contributed the most lines of code?',
    sql: `SELECT
  actor_login,
  SUM(additions) AS loc_added
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND type = 'PullRequestEvent'
  AND actor_login NOT LIKE '%bot%'
GROUP BY
  actor_login
ORDER BY
  2 DESC
LIMIT
  5`,
  },
  {
    id: 'star_again_and_again',
    type: 'sql',
    title: 'Who star/unstar this repo again and again...',
    sql: `SELECT
  actor_login,
  COUNT(*) AS cnt
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND type = 'WatchEvent' -- There is no unstar event in GitHub /events api
GROUP BY
  actor_login
HAVING
  cnt > 1
ORDER BY
  2 DESC
LIMIT
  100`,
  },
  {
    id: 'learn_about_yourself',
    title: '[Quiz] Learn about yourself',
    type: 'header',
  },
  {
    id: 'all_contributions_to_this_repo',
    type: 'sql',
    title: 'All your contributions to this repo',
    sql: `SELECT
  *
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND actor_login = '?' -- input your GitHub ID here`,
  },
  {
    id: 'biggest_pr',
    type: 'sql',
    title: 'Which is your biggest pull request to this repo',
    sql: `SELECT
  max(additions)
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND type = 'PullRequestEvent'
  AND actor_login = '?' -- input your GitHub ID here`,
  },
  {
    id: 'pr_or_push',
    type: 'sql',
    title: 'Which do you prefer, pull request or push?',
    sql: `SELECT
  type,
  count(*)
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND (
    (
      type = 'PullRequestEvent'
      AND action = 'opened'
    )
    OR type = 'PushEvent'
  )
  AND actor_login = '?' -- input your GitHub ID here
GROUP BY
  type`,
  },
];

const SQLEditor = (props: {
  placeholder?: string;
  mode: string;
  theme: string;
  name: string;
  onChange: (newValue: string) => void;
  value: string;
  fontSize?: number;
  showPrintMargin?: boolean;
  showGutter?: boolean;
  highlightActiveLine?: boolean;
  width?: string;
  height?: string;
  setOptions?: {
    useWorker?: boolean;
    enableBasicAutocompletion?: boolean;
    enableLiveAutocompletion?: boolean;
    enableSnippets?: boolean;
    showLineNumbers?: boolean;
    tabSize?: number;
  };
}) => {
  return (
    <BrowserOnly>
      {() => {
        const AceEditor = require('react-ace').default;
        require('ace-builds/src-noconflict/mode-sql');
        require('ace-builds/src-noconflict/theme-twilight');
        require('ace-builds/src-noconflict/ext-language_tools');
        return (
          <Box
            sx={{
              '& .ace_editor .ace_comment.ace_placeholder': {
                fontStyle: 'normal',
                transform: 'none',
                opacity: 1,
              },
            }}
          >
            <AceEditor
              placeholder={props.placeholder}
              mode={props.mode}
              theme={props.theme}
              name={props.name}
              // onLoad={props.onLoad}
              onChange={props.onChange}
              // onSelectionChange={this.onSelectionChange}
              // onCursorChange={this.onCursorChange}
              // onValidate={this.onValidate}
              value={props.value}
              fontSize={props.fontSize}
              showPrintMargin={props.showPrintMargin}
              showGutter={props.showGutter}
              highlightActiveLine={props.highlightActiveLine}
              width={props.width}
              height={props.height}
              setOptions={props.setOptions}
            />
          </Box>
        );
      }}
    </BrowserOnly>
  );
};

const dataListToRawOutput = (dataList: Array<{ [key: string]: string }>) => {
  const results: string[][] = [];
  const rowsMaxLength = dataList.reduce(
    (prev: { [key: string]: number }, item) => {
      Object.keys(item).forEach((itemKey) => {
        if (!(itemKey in prev)) {
          prev[itemKey] = item[itemKey].length;
        } else if (prev[itemKey] < item[itemKey].length) {
          prev[itemKey] = item[itemKey].length;
        }
      });
      return prev;
    },
    {},
  );
  let headStr = '';
  Object.keys(rowsMaxLength).forEach((key) => {
    const len = rowsMaxLength[key];
    const headLength = key.length;
    if (headLength > len) {
      rowsMaxLength[key] = headLength;
    }
    headStr += key.padEnd(rowsMaxLength[key], ' ') + ' | ';
  });
  dataList.forEach((item) => {
    const row: string[] = [];
    Object.keys(rowsMaxLength).forEach((key) => {
      const value = item[key];
      const maxLength = rowsMaxLength[key];
      row.push(value.padEnd(maxLength, ' '));
    });
    results.push(row);
  });

  let outputStr = '';
  for (let i = 0; i < results.length; i++) {
    const rowData = results[i].join(' | ');
    outputStr += rowData + '\n';
  }

  return `${headStr}\n${outputStr}`;
};
