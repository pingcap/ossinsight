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

import { useSQLPlayground } from "../../../components/RemoteCharts/hook";
import { useAnalyzeContext } from "../charts/context";
import Section from "../Section";
import { H2, P2 } from "../typography";
import { fontStyle } from "@mui/system";

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

  const aceRef = React.useRef<HTMLDivElement>(null);

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

  return (
    <BrowserOnly>
      {() => {
        const AceEditor = require("react-ace").default;
        require("ace-builds/src-noconflict/mode-sql");
        require("ace-builds/src-noconflict/theme-twilight");
        require("ace-builds/src-noconflict/ext-language_tools");
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
              sx={{
                minHeight: "75vh",
                maxHeight: "75vh",
                overflowY: "auto",
                width: "100%",
                padding: "1.5rem",
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <LoadingButton
                    variant="contained"
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
          </Drawer>
        );
      }}
    </BrowserOnly>
  );
};

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
