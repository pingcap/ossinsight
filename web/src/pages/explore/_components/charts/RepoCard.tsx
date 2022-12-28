import { ChartResult } from '@site/src/api/explorer';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import React from 'react';

export default function RepoCard ({ chartName, title, repo_name: repoName, data }: ChartResult & { data: any[] }) {
  return (
    <List>
      {data.map((item, index) => (
        <ListItem key={index}>
          <ListItemAvatar>
            <Avatar src={`https://github.com/${item[repoName].split('/')[0] as string}.png`} />
          </ListItemAvatar>
          <ListItemText>
            {item[repoName]}
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
