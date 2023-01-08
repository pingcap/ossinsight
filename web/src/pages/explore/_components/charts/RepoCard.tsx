import { ChartResult } from '@site/src/api/explorer';
import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';

export default function RepoCards ({ chartName, title, repo_name: repoName, data }: ChartResult & { data: any[] }) {
  return (
    <List>
      {data.map((item, index) => (
        <ListItem key={index}>
          <ListItemButton component="a" href={`https://github.com/${item[repoName] as string}`} target="_blank">
            <ListItemAvatar>
              <Avatar src={`https://github.com/${item[repoName].split('/')[0] as string}.png`} />
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
