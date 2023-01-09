import { ChartResult } from '@site/src/api/explorer';
import { Card, CardContent, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import React from 'react';
import { isFiniteNumber, isNullish, notFalsy } from '@site/src/utils/value';
import AnimatedNumber from 'react-awesome-animated-number';

export default function NumberCard ({ chartName, title, label, value, data }: ChartResult & { data: any[] }) {
  if (notFalsy(label)) {
    if (data.length === 1 && isNullish(data[0][label])) {
      const val = data[0][value];
      return (
        <Card>
          <CardContent sx={{ textAlign: 'center', fontSize: 36 }}>
            <Typography sx={{ opacity: 0.4 }} fontSize={22} mt={2} mb={0} color="text.secondary" gutterBottom align="center">
              {title}
            </Typography>
            {isFiniteNumber(val)
              ? (
              <AnimatedNumber value={data[0][value]} hasComma duration={800} size={36} />
                )
              : String(val)}
          </CardContent>
        </Card>
      );
    }
    return (
      <>
        <Typography variant="h4">{title}</Typography>
        <Grid container spacing={1} mt={1}>
          {data.map((item: any, index) => (
            <Grid key={index} item xs={12} sm={4} md={3} lg={2}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1">
                  {(item[label as string] as string)}
                </Typography>
                <Typography variant="body2" color="#7c7c7c">
                  {(item[value as string] as string)}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    );
  }
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
