import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { BottomNavigation, BottomNavigationAction, useEventCallback } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React, { useMemo } from 'react';

const SideContainer = styled('div')({
  width: '100%',
  height: 'calc(100vh - var(--ifm-navbar-height))',
  backgroundColor: '#242526',
});

const ColorBox = styled(Box)({
  backgroundColor: '#242526',
  height: '36px',
});

export interface NavigatorProps {
  value: string;
  type: 'side' | 'bottom';
}

export function Navigator({ value, type }: NavigatorProps) {
  const idx = useMemo(() => {
    return tabs.findIndex(el => el.id === value)
  }, [value])

  if (type === 'side') {
    return (
      <SideContainer>
        <ColorBox />
        <Tabs orientation="vertical" value={value ?? 'overview'}
              sx={{
                '.MuiTabs-flexContainer': {
                  gap: '16px',
                },
                '.MuiTab-root': {
                  fontSize: 14,
                  textDecoration: 'none',
                  textTransform: 'none',
                  py: 0.5,
                  pl: 4.5,
                  height: 28,
                  minHeight: 28,
                  alignItems: 'flex-start',
                },
              }}
              variant="scrollable"
              scrollButtons="auto"
        >
          {renderTabs(undefined, idx)}
        </Tabs>
      </SideContainer>
    );
  } else {
    return (
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation showLabels value={value ?? 'overview'}>
          {renderBottomNavigationActions(undefined)}
        </BottomNavigation>
      </Paper>
    );
  }
}

const tabs: { id: string, label: string, icon?: JSX.Element }[] = [
  { id: 'divider-0', label: 'Analytics', icon: <AnalyticsIcon fontSize='inherit' sx={{ mr: 0.5 }} /> },
  { id: 'overview', label: 'Overview' },
  { id: 'behaviour', label: 'Behaviour' },
  { id: 'star', label: 'Star' },
  { id: 'code', label: 'Code' },
  { id: 'code-review', label: 'Code Review' },
  { id: 'issue', label: 'Issue' },
  { id: 'divider-1', label: 'Monthly Stats', icon: <AutoGraphIcon fontSize='inherit' sx={{ mr: 0.5 }} /> },
  { id: 'activities', label: 'Contribution Activities' },
];

const matched = (n: number, i: number) => {
  return i > n && i - n <= 5
}

const renderTabs = (n: number | undefined, index: number) => {
  return tabs.slice(0, n).map((tab, i) => {
    if (tab.id.startsWith('divider-')) {
      return (
        <Tab
          key={tab.id}
          label={(
            <Stack sx={{ fontSize: 16, fontWeight: 'bold', pl: 2, color: matched(i, index) ? 'primary.main' : undefined }} direction="row" alignItems='center'>
              {tab.icon}
              <span>
                {tab.label}
              </span>
            </Stack>
          )}
          disabled
          sx={{ padding: '0 !important' }}
        />
      );
    } else {
      return (
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
      );
    }
  });
};

const renderBottomNavigationActions = (n?: number) => {
  return tabs.slice(0, n).map(tab => {
    if (tab.id.startsWith('divider-')) {
      return undefined;
    } else {
      return (
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
      );
    }
  });
};
