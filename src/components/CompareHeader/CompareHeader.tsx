import React from "react";
import RepoSelector, {Repo} from "./RepoSelector";
import {Stack} from "@mui/material";
import DateRangeSelector from "./DateRangeSelector";
import basicStyle from "../../pages/compare/index.module.css";
import useThemeContext from "@theme/hooks/useThemeContext";

interface CompareHeaderProps {
  repo1: Repo | null
  repo2: Repo | null
  onRepo1Change: (repo: Repo | null) => void
  onRepo2Change: (repo: Repo | null) => void
  dateRange: [Date | null, Date | null]
  onDateRangeChange: (range: [Date | null, Date | null]) => void
}

function CompareHeader(props: CompareHeaderProps) {
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
      <RepoSelector label="Repo Name 1" defaultRepoName="pingcap/tidb" repo={props.repo1} onChange={props.onRepo1Change}/>
      <RepoSelector label="Repo Name 2" defaultRepoName="tikv/tikv" repo={props.repo2} onChange={props.onRepo2Change}/>
      <DateRangeSelector value={props.dateRange} onChange={props.onDateRangeChange}/>
    </Stack>
  </header>
}

export default CompareHeader;
