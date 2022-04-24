import React from "react";
import RepoSelector, {Repo} from "./RepoSelector";
import Grid from "@mui/material/Grid";
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Box, {BoxProps} from "@mui/material/Box";
import useThemeContext from "@theme/hooks/useThemeContext";
import {combineSx} from "../../utils/mui";

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

interface CompareHeaderProps extends BoxProps {
  repo1: Repo | null
  repo2: Repo | null
  onRepo1Change: (repo: Repo | null) => void
  onRepo2Change: (repo: Repo | null) => void
  onRepo1Valid: (repo: Repo | null) => string | undefined
  onRepo2Valid: (repo: Repo | null) => string | undefined
}

function CompareHeader({
  repo1,
  repo2,
  onRepo1Change,
  onRepo2Change,
  onRepo1Valid,
  onRepo2Valid,
  sx,
  ...props
}: CompareHeaderProps) {
  const {isDarkTheme} = useThemeContext();

  return (
    <Box
      position='sticky'
      sx={combineSx({
        my: 2,
        py: 2,
        top: 'var(--ifm-navbar-height)',
        zIndex: 'var(--ifm-z-index-fixed-mui)',
        backgroundColor: isDarkTheme ? 'var(--ifm-background-color)' : 'background.default',
        borderBottom: '1px solid transparent',
        borderBottomColor: 'divider'
      }, sx)}
      {...props}
    >
      <Grid container>
        <Grid item xs={5}>
          <RepoSelector
            label="Repo Name 1"
            defaultRepoName="pingcap/tidb"
            repo={repo1}
            onChange={onRepo1Change}
            onValid={onRepo1Valid}
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
            repo={repo2}
            onChange={onRepo2Change}
            onValid={onRepo2Valid}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default CompareHeader;
