import React from "react";
import RepoSelector, {Repo} from "./RepoSelector";
import Grid from "@mui/material/Grid";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import {useTheme} from "@mui/material/styles";

interface ElevationScrollProps {
  children: React.ReactElement
  target?: Node | Window
}

function ElevationScroll(props: ElevationScrollProps) {
  const {children, target} = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target
  });

  return React.cloneElement(children, {
    elevation: trigger ? 1 : 0,
  });
}

interface ElevateAppBarProps {
  children: React.ReactElement
}

interface CompareHeaderProps {
  repo1: Repo | null
  repo2: Repo | null
  onRepo1Change: (repo: Repo | null) => void
  onRepo2Change: (repo: Repo | null) => void
  dateRange: [Date | null, Date | null]
  onDateRangeChange: (range: [Date | null, Date | null]) => void
}

function CompareHeader(props: CompareHeaderProps) {
  const theme = useTheme();
  const fullWidth = theme.breakpoints.up(1201)
  return (
    <ElevationScroll>
      <AppBar color='inherit' position='sticky' sx={{ [fullWidth]: { borderRadius: 1 }, my: 2, top: 'var(--ifm-navbar-height)' }} enableColorOnDark>
        <Toolbar>
          <Grid container>
            <Grid item xs={5}>
              <RepoSelector label="Repo Name 1" defaultRepoName="pingcap/tidb" repo={props.repo1}
                            onChange={props.onRepo1Change} />
            </Grid>
            <Grid item xs={2} zeroMinWidth/>
            <Grid item xs={5}>
              <RepoSelector label="Repo Name 2" defaultRepoName="tikv/tikv" repo={props.repo2}
                            onChange={props.onRepo2Change} />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </ElevationScroll>
  )
}

export default CompareHeader;
