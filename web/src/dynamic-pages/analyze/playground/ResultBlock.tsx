import { Alert, AlertTitle, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { isNullish, notFalsy, notNullish } from '@site/src/utils/value';
import CodeBlock from '@theme/CodeBlock';
import * as React from 'react';
import { useMemo } from 'react';
import { AsyncData, RemoteData } from '@site/src/components/RemoteCharts/hook';
import { ResultBlockContainer, ResultBlockEmptyContainer, ResultBlockErrorContainer } from '@site/src/dynamic-pages/analyze/playground/styled';
import { getErrorMessage } from '@site/src/utils/error';

export interface ResultBlockProps extends AsyncData<RemoteData<any, any>> {
}

export default function ResultBlock ({ data, loading, error }: ResultBlockProps) {
  const isExplain = useMemo(() => {
    return notNullish((data?.sql?.match(/\bEXPLAIN\b/i)));
  }, [data]);

  if (notFalsy(error)) {
    return (
      <ResultBlockErrorContainer>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {`${getErrorMessage(error)}`}
        </Alert>
      </ResultBlockErrorContainer>
    );
  }
  if (isNullish(data)) {
    if (!loading) {
      return (
        <ResultBlockEmptyContainer>
          <Typography variant="body1" color="#565656">
            Your query result will appear here.
          </Typography>
        </ResultBlockEmptyContainer>
      );
    } else {
      return (
        <ResultBlockEmptyContainer>
          <CircularProgress />
        </ResultBlockEmptyContainer>
      );
    }
  }

  return (
    <ResultBlockContainer>
      <Typography variant="body2" sx={{ padding: '1rem' }}>
        {`${data.data.length} results in ${data.spent.toFixed(
          2,
        )}s.`}
      </Typography>
      {isExplain
        ? (
          <CodeBlock>{dataListToRawOutput(data.data)}</CodeBlock>
          )
        : (
            renderTable(data.data)
          )}
    </ResultBlockContainer>
  );
}

const renderTable = (data: Array<{ [x: string]: string | number }>) => {
  return (
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
