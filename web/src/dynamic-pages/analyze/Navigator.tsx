import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { BottomNavigation, BottomNavigationAction, Box, Paper, Stack, styled, Tab, Tabs } from '@mui/material';
import React, { useMemo } from 'react';
import MilestoneIcon from '@site/src/components/milestone/icon.svg';
import { isNullish, notNullish } from '@site/src/utils/value';

const SideContainer = styled('div')({
  width: '100%',
  height: 'calc(100vh - var(--ifm-navbar-height))',
  backgroundColor: '#242526',
});

const ColorBox = styled(Box)({
  backgroundColor: '#242526',
  height: '76px',
});

export interface NavigatorProps {
  value: string;
  type: 'side' | 'bottom';
  comparing: boolean;
  scrollTo: (index: string) => void;
}

export function Navigator ({ value, type, comparing, scrollTo }: NavigatorProps) {
  const idx = useMemo(() => {
    return tabs.findIndex(el => el.id === value);
  }, [value]);

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
          {renderTabs(comparing ? 6 : undefined, idx, scrollTo)}
        </Tabs>
      </SideContainer>
    );
  } else {
    return (
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation showLabels value={value ?? 'overview'}>
          {renderBottomNavigationActions(comparing ? 6 : undefined)}
        </BottomNavigation>
      </Paper>
    );
  }
}

const tabs: Array<{ id: string, label: string, icon?: JSX.Element }> = [
  { id: 'divider-0', label: 'Analytics', icon: <AnalyticsIcon fontSize="inherit" sx={{ mr: 0.5 }} /> },
  { id: 'overview', label: 'Overview' },
  { id: 'people', label: 'People' },
  { id: 'commits', label: 'Commits' },
  { id: 'pull-requests', label: 'Pull Requests' },
  { id: 'issues', label: 'Issues' },
  { id: 'divider-1', label: 'Monthly Stats', icon: <AutoGraphIcon fontSize="inherit" sx={{ mr: 0.5 }} /> },
  { id: 'repository', label: 'Repository' },
  { id: 'contributors', label: 'Contributors' },
  { id: 'highlights', label: 'Highlights', icon: <MilestoneIcon style={{ marginRight: 4 }} /> },
];

// This method indicates whether the group name of the navbar label should be highlighted.
//
// FIXME: We should refactor the navigator code base.
const matched = (n: number, i: number) => {
  return (
    // for any group, current tab index is greater than label index
    i > n &&
    // for group 0, i - n lt 5
    // for group 1, i - n gte 5
    i - n <= 5 &&
    // for group 2 (special one, which is both label and tab), i - n === 9
    i < 9
  );
};

const renderTabs = (n: number | undefined, index: number, scrollTo: (index: string) => void) => {
  return tabs.slice(0, n).map((tab, i) => {
    if (tab.id.startsWith('divider-')) {
      return (
        <Tab
          key={tab.id}
          label={(
            <Stack sx={{ fontSize: 16, fontWeight: 'bold', pl: 2, color: matched(i, index) ? 'primary.main' : undefined }} direction="row" alignItems="center">
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
          label={
            isNullish(tab.icon)
              ? tab.label
              : (
                <Stack sx={{ fontSize: 16, fontWeight: 'bold', pl: 2, color: i === index ? 'primary.main' : undefined }} direction="row" alignItems="center">
                  {tab.icon}
                  <span>
                    {tab.label}
                  </span>
                </Stack>
                )
          }
          value={tab.id}
          disableRipple
          sx={{ padding: notNullish(tab.icon) ? '0 !important' : undefined }}
          onClick={() => scrollTo(tab.id)}
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
          onClick={() => {
            document.getElementById(tab.id)?.scrollIntoView();
          }}
        />
      );
    }
  });
};
