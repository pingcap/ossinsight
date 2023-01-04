import { ChartResult } from '@site/src/api/explorer';
import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';

export default function PersonalCard ({ chartName, title, user_login: userLogin, data }: ChartResult & { data: any[] }) {
  return (
    <List>
      {data.map((item, index) => (
        <ListItem key={index}>
          <ListItemButton component='a' href={`https://github.com/${item[userLogin] as string}`} target='_blank'>
            <ListItemAvatar>
              <Avatar src={`https://github.com/${item[userLogin] as string}.png`} />
            </ListItemAvatar>
            <ListItemText>
              {item[userLogin]}
            </ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
