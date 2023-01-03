import { ChartResult } from '@site/src/api/explorer';
import { Card, List, ListItem, ListItemText } from '@mui/material';
import React from 'react';

export default function NumberCard ({ chartName, title, value, data }: ChartResult & { data: any[] }) {
  return (
    <List>
      {data.map((item: any, index) => (
        <ListItem key={index}>
          <Card sx={{ p: 4 }}>
            <ListItemText primary={title} secondary={`${(item[value as string] as string)}`} />
          </Card>
        </ListItem>
      ))}
    </List>
  );
}
