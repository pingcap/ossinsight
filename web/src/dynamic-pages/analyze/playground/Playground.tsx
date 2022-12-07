import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useSQLPlayground } from '@site/src/components/RemoteCharts/hook';
import { format } from 'sql-formatter';
import { Alert, AlertTitle, Box, Button, Drawer, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useEventCallback } from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import { isFiniteNumber, isNullish, notFalsy, notNullish } from '@site/src/utils/value';
import LoadingButton from '@mui/lab/LoadingButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeBlock from '@theme/CodeBlock';
import { useAnalyzeContext } from '../charts/context';
import SQLEditor from './SQLEditor';
import { PredefinedQuestion } from '@site/src/dynamic-pages/analyze/playground/predefined';
import PredefinedGroups from '@site/src/dynamic-pages/analyze/playground/PredefinedGroups';
import { PlaygroundBody, PlaygroundContainer, PlaygroundHeadline, PlaygroundHeadlineExtra, PlaygroundMain, PlaygroundSide } from '@site/src/dynamic-pages/analyze/playground/styled';

function Playground ({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { repoName, repoId } = useAnalyzeContext();
  const [inputValue, setInputValue] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<PredefinedQuestion>();
  const [sql, setSQL] = useState('');

  const onChange = (newValue: string) => {
    setInputValue(newValue);
    setCurrentQuestion(undefined);
  };

  const { data, loading, error } = useSQLPlayground(
    sql,
    'repo',
    `${repoId ?? 'undefined'}`,
  );

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

  const handleSelectQuestion = useEventCallback((question: PredefinedQuestion) => {
    const trueSql = [
      { match: 'repoId', value: `${repoId ?? 'undefined'}` },
      { match: 'repoName', value: repoName ?? 'undefined' },
    ].reduce((sql, { match, value }) => sql.replaceAll(`{{${match}}}`, value), question.sql);
    setInputValue(trueSql);
    setCurrentQuestion(question);
  });

  const defaultInput = useMemo(() => {
    return `
/* ⚠️ 
Playground uses LIMITED resource(cpu/mem), so SQL should add:

WHERE repo_id = ${repoId ?? 'undefined'}

to use index as much as possible, or it will be terminated.


Example:

SELECT
*
FROM
github_events
WHERE
repo_id = ${repoId ?? '{{repoId}}'}
LIMIT
1;
*/
`;
  }, [repoId]);

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
    >
      <PlaygroundContainer id="sql-playground-container">
        <PlaygroundHeadline>
          <Typography variant="h2" component="div" sx={{ flexGrow: 1, color: 'orange' }}>
            Playground: Based on Row-Oriented Storage Engine
          </Typography>
          <PlaygroundHeadlineExtra>
            <Button
              variant="contained"
              size="small"
              disabled={!inputValue || isNullish(repoId)}
              onClick={handleFormatSQLClick}
            >
              Format
            </Button>
            <LoadingButton
              variant="contained"
              size="small"
              disabled={!inputValue || isNullish(repoId)}
              onClick={handleSubmit}
              endIcon={<PlayArrowIcon fontSize="inherit" />}
              loading={loading}
            >
              Run
            </LoadingButton>
          </PlaygroundHeadlineExtra>
        </PlaygroundHeadline>
        <PlaygroundBody>
          <PlaygroundSide>
            <PredefinedGroups onSelectQuestion={handleSelectQuestion} question={currentQuestion} />
          </PlaygroundSide>
          <PlaygroundMain>
            <SQLEditor
              mode="sql"
              theme="twilight"
              onChange={onChange}
              name="SQL_PLAYGROUND"
              width="100%"
              height={data?.data ? '250px' : '350px'}
              showPrintMargin={false}
              value={inputValue || defaultInput}
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
          </PlaygroundMain>
        </PlaygroundBody>
      </PlaygroundContainer>
    </Drawer>
  );
}

export function usePlayground () {
  const [open, setOpen] = useState(true);

  const handleClose = useEventCallback(() => {
    setOpen(false);
  });

  const handleClickTerminalBtn = useEventCallback((event: React.MouseEvent<HTMLElement>) => {
    setOpen(true);
  });

  useEffect(() => {
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

  const button = useMemo(() => {
    return (
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
    );
  }, []);

  const drawer = <Playground open={open} onClose={handleClose} />;

  return { button, drawer };
}

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
