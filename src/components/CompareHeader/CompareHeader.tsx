import React from "react";
import RepoSelector from "./RepoSelector";
import {Stack, useTheme} from "@mui/material";
import DateRangeSelector from "./DateRangeSelector";
import basicStyle from "../../pages/compare/index.module.css";

function CompareHeader(props) {
  const theme = useTheme();

  return <header className={basicStyle.mainHeader} style={{
    backgroundColor: theme.palette.background.default,
    borderBottomColor:  theme.palette.divider,
  }}>
    <Stack
      direction="row"
      justifyContent="left"
      alignItems="left"
      spacing={2}
      style={{ marginBottom: '20px' }}
    >
      <RepoSelector label="Repo Name 1" defaultRepoName="pingcap/tidb" onChange={(repo) => {
        props.onRepo1Change(repo);
      }}/>
      <RepoSelector label="Repo Name 2" defaultRepoName="tikv/tikv" onChange={(repo) => {
        props.onRepo2Change(repo);
      }}/>
      <DateRangeSelector onChange={((dateRange) => {
        props.onDateRangeChange(dateRange);
      })}/>
    </Stack>
  </header>
}

export default CompareHeader;
