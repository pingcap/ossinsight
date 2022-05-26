import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { GitCommitIcon, GitPullRequestIcon, IssueClosedIcon, PersonIcon } from '@primer/octicons-react';
import React, { useState } from 'react';
import { HashLink } from 'react-router-hash-link';


const SideContainer = styled('div')({
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(124,124,124, 10%)',
});

const ColorBox = styled(Box)({
  backgroundColor: 'rgba(124,124,124, 10%)',
  height: '76px',
});

export function Side({ value, setValue }: { value: string, setValue: (value: string) => void}) {
  return (
    <SideContainer>
      <ColorBox />
      <Tabs orientation="vertical" value={value} onChange={(e, v) => setValue(v)}
            sx={{
              '.MuiTabs-flexContainer': {
                gap: '16px',
              },
              '.MuiTab-root': {
                fontSize: 12,
                textDecoration: 'none'
              },
            }}
            variant="scrollable"
            scrollButtons
      >
        <Tab component='a' href='#overview' label="Overview" value='overview' icon={<HomeRoundedIcon />} />
        <Tab component='a' href='#commits' label="Commits" value='commits' icon={<GitCommitIcon />} />
        <Tab component='a' href='#pull-requests' label="Pull Requests" value='pull-requests' icon={<GitPullRequestIcon />} />
        <Tab component='a' href='#issues' label="Issues" value='issues' icon={<IssueClosedIcon />} />
        <Tab component='a' href='#people' label="People" value='people' icon={<PersonIcon />} />
      </Tabs>
    </SideContainer>
  );
}
