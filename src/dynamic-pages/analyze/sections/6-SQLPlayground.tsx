import * as React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { format } from "sql-formatter";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import LoadingButton from "@mui/lab/LoadingButton";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import { useSQLPlayground } from "../../../components/RemoteCharts/hook";
import { useAnalyzeContext } from "../charts/context";

const renderTable = (data: { [x: string]: any }[]) => {
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
              {data[0] &&
                Object.keys(data[0]).map((key) => (
                  <TableCell
                    key={`th=${key}`}
                    sx={{
                      whiteSpace: "nowrap",
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
                            whiteSpace: "nowrap",
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
                          whiteSpace: "nowrap",
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

export const SQLPlaygroundDrawer = () => {
  const [inputValue, setInputValue] = React.useState("");
  const [sql, setSQL] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const { repoId, repoName, comparingRepoId } = useAnalyzeContext();

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setOpen(open);
    };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toUpperCase() === "K" && (event.ctrlKey || event.metaKey)) {
        //it was Ctrl + K (Cmd + K)
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onChange = (newValue: string) => {
    setInputValue(newValue);
  };

  const { data, loading, error } = useSQLPlayground(sql, "repo", `${repoId}`);

  React.useEffect(() => {
    if (data?.sql) {
      const formattedSQL = format(data.sql, {
        language: "mysql",
        uppercase: true,
        linesBetweenQueries: 2,
      });
      setInputValue(formattedSQL);
    }
  }, [data]);

  const handleSubmit = async () => {
    setSQL(inputValue);
  };

  const handlePredefinedSQLChange = (targetSQL: string) => {
    setInputValue(targetSQL);
  };

  return (
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
          height: "75vh",
          overflow: "hidden",
          width: "100%",
          padding: "1rem",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ marginBottom: "1rem", height: "100%" }}
        >
          <Box
            id="playground-left"
            sx={{
              height: "calc(100% - 3.28rem)",
              marginTop: "3.28rem",
              overflowY: "auto",
              width: "40%",
              maxWidth: "33vw",
            }}
          >
            <PreDefinedSQLList
              hadnleClick={handlePredefinedSQLChange}
              replacements={[
                { match: "repoId", value: `${repoId}` },
                { match: "repoName", value: repoName },
              ]}
            />
          </Box>
          <Box
            id="playground-right"
            sx={{
              height: "100%",
              overflowY: "auto",
              width: "100%",
              padding: "0 1rem",
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <LoadingButton
                  variant="contained"
                  size="small"
                  disabled={!inputValue || !repoId}
                  onClick={handleSubmit}
                  endIcon={<PlayArrowIcon fontSize="inherit" />}
                  loading={loading}
                  sx={{
                    marginLeft: "auto",
                  }}
                >
                  Run
                </LoadingButton>
              </Stack>

              <SQLEditor
                mode="sql"
                theme="twilight"
                onChange={onChange}
                name="SQL_PLAYGROUND"
                width="100%"
                height="200px"
                showPrintMargin={false}
                value={inputValue}
                placeholder={`\nThe search scope is limited to the current repo, and the LIMIT is 100.\n\nExample:\n\nSELECT * FROM github_events WHERE repo_name = '${repoName}' LIMIT 100;`}
                fontSize={16}
                setOptions={{
                  enableLiveAutocompletion: true,
                }}
              />

              {error && (
                <Alert severity="error">
                  <AlertTitle>Error</AlertTitle>
                  {`${error}`}
                </Alert>
              )}
              <Box>{data?.data && renderTable(data.data)}</Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
};

const PreDefinedSQLList = (props: {
  title?: string;
  hadnleClick: (sql: string) => void;
  replacements?: { match: string; value: string }[]; // Replace the string `{{match}}` with `value` in SQL
}) => {
  const {
    title = "Pre-defined SQL",
    hadnleClick = () => {},
    replacements = [],
  } = props;

  return (
    <Box>
      <List>
        {PREDEFINED_SQL_LIST.map((item) => {
          let sql = item.sql;

          replacements.forEach((replacement) => {
            sql = sql.replaceAll(`{{${replacement.match}}}`, replacement.value);
          });

          return (
            <ListItem disablePadding key={item.id}>
              <ListItemButton
                onClick={() => {
                  hadnleClick(sql);
                }}
              >
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

// Support variables in SQL: use {{<your variable>}}
const PREDEFINED_SQL_LIST = [
  {
    id: "table_schema",
    name: "Show table schema!",
    sql: "DESC github_events;",
  },
  {
    id: "table_indexes",
    name: "Show table indexes",
    sql: `SHOW indexes
FROM
  github_events;`,
  },
  {
    id: "example_row",
    name: "This is an example row",
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
    id: "total_events_of_this_repo",
    name: "Total events of these repo - Realtime",
    sql: `-- Delayed by 5 minutes: https://github.blog/changelog/2018-08-01-new-delay-public-events-api/
SELECT
  COUNT(*)
FROM
  github_events
WHERE
  -- repo_name = '{{repoName}}' -- try use this and find out why
  repo_id = {{repoId}}
LIMIT
  100`,
  },
  {
    id: "first_pr",
    name: "Who created the first pull request of this repo?",
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
    id: "first_issue",
    name: "Who closed the first issue?",
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
    id: "latest_stargazer",
    name: "Who is the latest stargazer?",
    sql: `SELECT
  *
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND type = 'WatchEvent'
ORDER BY
  created_at DESC
LIMIT
  1
;`,
  },
  {
    id: "active_reviewer",
    name: "Who is the most active reviewer?",
    sql: `
SELECT
  actor_login,
  COUNT(*) AS comments
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND actor_login NOT LIKE '%bot%'
  AND type IN (
    'IssueCommentEvent',
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
    id: "loc",
    name: "Who contributed the most lines of code?",
    sql: `SELECT
  actor_login,
  SUM(additions) AS loc_added
FROM
  github_events
WHERE
  repo_id = {{repoId}}
  AND (type = 'PullRequestEvent')
GROUP BY
  actor_login
ORDER BY
  2 DESC
LIMIT
  5`,
  },
];

const SQLEditor = (props: {
  placeholder: string;
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
        const AceEditor = require("react-ace").default;
        require("ace-builds/src-noconflict/mode-sql");
        require("ace-builds/src-noconflict/theme-twilight");
        require("ace-builds/src-noconflict/ext-language_tools");
        return (
          <Box
            sx={{
              "& .ace_editor .ace_comment.ace_placeholder": {
                fontStyle: "normal",
                transform: "none",
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
