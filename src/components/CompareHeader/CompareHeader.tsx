import React from "react";
import RepoSelector from "./RepoSelector";
import {Stack} from "@mui/material";
import DateRangeSelector from "./DateRangeSelector";
import basicStyle from "../../pages/compare/index.module.css";
import useThemeContext from "@theme/hooks/useThemeContext";

function CompareHeader(props) {
  const { isDarkTheme } = useThemeContext();

  return <header className={basicStyle.mainHeader} style={{
    backgroundColor: isDarkTheme ? '#242526' : '#f9fbfc'
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
