import * as React from "react";
import { render, unmountComponentAtNode } from "react-dom";
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

import { useSQLPlayground } from "../../../components/RemoteCharts/hook";
import { useAnalyzeContext } from "../charts/context";
import Section from "../Section";
import { H2, P2 } from "../typography";

function renderAce(
  container: HTMLElement,
  value: string,
  onChange?: (value: string, event?: any) => void
) {
  const AceEditor = require('react-ace').default;
  require('ace-builds/src-noconflict/mode-sql');
  require('ace-builds/src-noconflict/theme-twilight');
  require('ace-builds/src-noconflict/ext-language_tools');
  render(
    <AceEditor
      mode="sql"
      theme="twilight"
      onChange={onChange}
      name="UNIQUE_ID_OF_DIV"
      editorProps={{ $blockScrolling: true }}
      enableLiveAutocompletion
      width="100%"
      height="200px"
      showPrintMargin={false}
      value={value}
      placeholder="The search scope is limited to the current repo, and the LIMIT is 100."
    />,
    container
  );
}

export const SQLPlayground = React.forwardRef(function (
  {},
  ref: React.ForwardedRef<HTMLElement>
) {
  const [inputValue, setInputValue] = React.useState("");
  const [sql, setSQL] = React.useState("");

  const onChange = (newValue: string) => {
    setInputValue(newValue);
  };

  React.useEffect(() => {
    const container = document.getElementById("ace-container");
    if (container) {
      renderAce(container, inputValue, onChange);
      return () => {
        unmountComponentAtNode(container);
      };
    }
  }, []);

  const { repoId } = useAnalyzeContext();

  const { data, loading, error } = useSQLPlayground(sql, "repo", `${repoId}`);

  const handleSubmit = async () => {
    console.log("query", inputValue);
    setSQL(inputValue);
  };

  return (
    <Section id="sql-playground" ref={ref}>
      <H2>SQL Playground</H2>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <LoadingButton
            variant="contained"
            disabled={!inputValue || !repoId}
            onClick={handleSubmit}
            endIcon={<PlayArrowIcon fontSize="inherit" />}
            loading={loading}
          >
            Run
          </LoadingButton>
        </Stack>
        <Box
          id={`ace-container`}
          sx={{
            width: "100%",
          }}
        />
        {error && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {`${error}`}
          </Alert>
        )}
        <Box>{data && renderTable(data)}</Box>
      </Stack>
    </Section>
  );
});

const renderTable = (data: { [x: string]: any }[]) => {
  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650, marginBottom: 0 }} aria-label="data table" size="small">
          <TableHead>
            <TableRow>
              {data[0] &&
                Object.keys(data[0]).map((key) => (
                  <TableCell key={`th=${key}`}>{key}</TableCell>
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
                        <TableCell key={key} component="th" scope="row">
                          {`${row[key]}`}
                        </TableCell>
                      );
                    }
                    return <TableCell key={key}>{`${row[key]}`}</TableCell>;
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
