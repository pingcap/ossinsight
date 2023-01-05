import { ChartResult } from '@site/src/api/explorer';
import { Avatar, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import React, { useMemo } from 'react';
import { isNonemptyString } from '@site/src/utils/value';
import BadDataAlert from '@site/src/pages/explore/_components/charts/BadDataAlert';

export default function RepoCards ({ chartName, title, repo_name: repoName, data }: ChartResult & { data: any[] }) {
  const validData = useMemo(() => {
    return data.filter(item => isNonemptyString(item[repoName]) && item[repoName].indexOf('/') > 0);
  }, [data, repoName]);

  const hasInvalidData = validData.length !== data.length;

  return (
    <>
      {hasInvalidData && (<BadDataAlert />)}
      <List>
        {validData.map((item, index) => (
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
    </>
  );
}
