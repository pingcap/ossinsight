import { ChartResult } from '@site/src/api/explorer';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import React from 'react';

export default function PersonalCard ({ chartName, title, id, data }: ChartResult & { data: any[] }) {
  return (
    <List>
      {data.map((item, index) => (
        <ListItem key={index}>
          <ListItemAvatar>
            <Avatar src={`https://github.com/${item[id] as string}.png`} />
          </ListItemAvatar>
          <ListItemText>
            {item[id]}
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );
}
