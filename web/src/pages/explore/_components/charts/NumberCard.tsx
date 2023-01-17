import { ChartResult } from '@site/src/api/explorer';
import { Card, CardContent, Grid, List, ListItem, ListItemText, styled, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { isFiniteNumber, isNonemptyString, nonEmptyArray, notFalsy, notNullish } from '@site/src/utils/value';
import AnimatedNumber from 'react-awesome-animated-number';

export default function NumberCard ({ chartName, title, label: propLabel, value, data, columns, fields: propFields }: ChartResult & { data: any[], fields?: Array<{ name: string }> }) {
  const fields = useMemo(() => {
    if (nonEmptyArray(columns)) {
      return columns.map((name: string) => ({ name }));
    } else if (notNullish(propFields)) {
      return propFields;
    } else {
      if (data.length > 0) {
        return Object.keys(data[0]).map(name => ({ name }));
      } else {
        return [{ name: '' }];
      }
    }
  }, [data, columns, propFields]);

  const label = useMemo(() => {
    if (isNonemptyString(propLabel)) {
      return propLabel;
    }
    return propFields?.find(f => /repo|name|user|login/.test(f.name) && f.name !== value)?.name ?? '';
  }, [fields, propLabel]);

  if (data.length === 1) {
    const lab = data[0][label] ?? title;
    const val = data[0][value];
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', fontSize: 36 }}>
          <Typography sx={{ opacity: 0.4 }} fontSize={22} mt={2} mb={0} color="text.secondary" gutterBottom align="center">
            {lab}
          </Typography>
          {isFiniteNumber(val)
            ? (
              <AnimatedNumber value={data[0][value]} hasComma duration={800} size={36} />
              )
            : String(val)}
          <Unit>{value}</Unit>
        </CardContent>
      </Card>
    );
  }

  if (notFalsy(label)) {
    return (
      <>
        <Typography variant="h4">{title}</Typography>
        <Grid container spacing={1} mt={1}>
          {data.map((item: any, index) => (
            <Grid key={index} item xs={12} sm={4} md={3} lg={2}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1">
                  {(item[label] as string)}
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

const Unit = styled('span')`
  font-size: 16px;
  opacity: 0.3;
  margin-left: 4px;
`;
