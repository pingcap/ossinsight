import { ChartResult } from '@site/src/api/explorer';
import { List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';
import GhAvatar from '@site/src/pages/explore/_components/GhAvatar';

export default function RepoCards ({ chartName, title, repo_name: repoName, data }: ChartResult & { data: any[] }) {
  return (
    <List>
      {data.map((item, index) => (
        <ListItem key={index}>
          <ListItemButton component="a" href={`https://github.com/${item[repoName] as string}`} target="_blank">
            <ListItemAvatar>
              <GhAvatar name={item[repoName].split('/')[0]} />
            </ListItemAvatar>
            <ListItemText>
              {item[repoName]}
            </ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
