import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { BottomNavigation, BottomNavigationAction, useEventCallback } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { GitCommitIcon, GitPullRequestIcon, IssueClosedIcon, PersonIcon } from '@primer/octicons-react';
import React from 'react';

const SideContainer = styled('div')({
  width: '100%',
  height: 'calc(100vh - var(--ifm-navbar-height) - 22px)',
  backgroundColor: '#242526',
});

const ColorBox = styled(Box)({
  backgroundColor: '#242526',
  height: '76px',
});

export interface NavigatorProps {
  value: string
  type: 'side' | 'bottom'
}

export function Navigator({ value, type }: NavigatorProps) {
  if (type === 'side') {
    return (
      <SideContainer>
        <ColorBox />
        <div style={{ height: '100%', display: 'flex' }}>
          <Tabs orientation="vertical" value={value ?? 'overview'}
                sx={{
                  '.MuiTabs-flexContainer': {
                    gap: '16px',
                  },
                  '.MuiTab-root': {
                    fontSize: 12,
                    textDecoration: 'none',
                    textTransform: 'none',
                  },
                }}
                variant="scrollable"
                scrollButtons='auto'
          >
            {renderTabs()}
          </Tabs>
        </div>
      </SideContainer>
    );
  } else {
    return (
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation showLabels value={value ?? 'overview'} >
          {renderBottomNavigationActions()}
        </BottomNavigation>
      </Paper>
    )
  }
}

const tabs: { id: string, label: string, icon: JSX.Element }[] = [
  { id: 'overview', label: 'Overview', icon: <HomeRoundedIcon /> },
  { id: 'commits', label: 'Commits', icon: <GitCommitIcon /> },
  { id: 'pull-requests', label: 'Pull Requests', icon: <GitPullRequestIcon /> },
  { id: 'issues', label: 'Issues', icon: <IssueClosedIcon /> },
  { id: 'people', label: 'People', icon: <PersonIcon /> },
];

const renderTabs = () => {
  return tabs.map(tab => (
    <Tab
      key={tab.id}
      label={tab.label}
      value={tab.id}
      icon={tab.icon}
      disableRipple
      onClick={useEventCallback(() => {
        document.getElementById(tab.id)?.scrollIntoView();
      })}
    />
  ))
}

const renderBottomNavigationActions = () => {
  return tabs.map(tab => (
    <BottomNavigationAction
      key={tab.id}
      label={tab.label}
      value={tab.id}
      icon={tab.icon}
      disableRipple
      onClick={useEventCallback(() => {
        document.getElementById(tab.id)?.scrollIntoView();
      })}
    />
  ))
}
