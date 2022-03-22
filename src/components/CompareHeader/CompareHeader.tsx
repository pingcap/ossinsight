import React from "react";
import RepoSelector, {Repo} from "./RepoSelector";
import Grid from "@mui/material/Grid";
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Box from "@mui/material/Box";
import useThemeContext from "@theme/hooks/useThemeContext";

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
  onRepo1Valid: (repo: Repo | null) => string | undefined
  onRepo2Valid: (repo: Repo | null) => string | undefined
}

function CompareHeader(props: CompareHeaderProps) {
  const {isDarkTheme} = useThemeContext();

  return (
    <Box position='sticky' sx={{
      my: 2,
      py: 2,
      top: 'var(--ifm-navbar-height)',
      zIndex: 1,
      backgroundColor: isDarkTheme ? 'var(--ifm-background-color)' : 'background.default',
      borderBottom: '1px solid transparent',
      borderBottomColor: 'divider'
    }}>
      <Grid container>
        <Grid item xs={5}>
          <RepoSelector
            label="Repo Name 1"
            defaultRepoName="pingcap/tidb"
            repo={props.repo1}
            onChange={props.onRepo1Change}
            onValid={props.onRepo1Valid}
          />
        </Grid>
        <Grid item xs={2}>
          <Box sx={{
            borderRadius: 1,
            maxWidth: 'min-content',
            margin: 'auto',
            px: 2,
            backgroundColor: 'text.primary',
            color: 'background.default',
            fontWeight: 'bolder'
          }}>
            VS.
          </Box>
        </Grid>
        <Grid item xs={5}>
          <RepoSelector
            label="Repo Name 2"
            defaultRepoName="tikv/tikv"
            repo={props.repo2}
            onChange={props.onRepo2Change}
            onValid={props.onRepo2Valid}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default CompareHeader;
