import CustomPage from '@site/src/theme/CustomPage';
import React, { useCallback } from 'react';
import { useSubscriptions } from '@site/src/api/user';
import { Avatar, Box, Container, IconButton, List, ListItem, ListItemAvatar, ListItemText, Skeleton, Typography } from '@mui/material';
import { clientWithoutCache } from '@site/src/api/client';
import { Unsubscribe } from '@mui/icons-material';
import EnableEmailSwitch from '@site/src/pages/subscriptions/EnableEmailSwitch';

const fmt = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

export default function () {
  const { data = [], mutate, isValidating } = useSubscriptions();

  const unsubscribe = useCallback(function (name: string) {
    clientWithoutCache.put(`/repos/${name}/unsubscribe`, undefined, { withCredentials: true })
      .then(async () => await mutate())
      .catch(console.error);
  }, [mutate]);

  return (
    <CustomPage>
      <Container maxWidth="sm" sx={{ pt: 6, pb: 12 }}>
        <Typography variant="h1">
          My Subscriptions
        </Typography>
        <Box>
          <EnableEmailSwitch />
        </Box>
        {!isValidating && data.length === 0 && (
          <Typography variant="h2" sx={{ mt: 4 }} color="text.disabled">You have no subscriptions yet</Typography>
        )}
        <List>
          {isValidating && data.length === 0 && [0, 1, 2, 3, 4].map(i => (
            <ListItem
              key={i}
            >
              <ListItemAvatar>
                <Skeleton width={40} height={40} variant="circular" />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton variant="text" width="40%" />}
                secondary={<Skeleton variant="text" width="30%" />}
              />
            </ListItem>
          ))}
          {data.map(sub => (
            <ListItem
              key={sub.repoId}
              secondaryAction={
                <IconButton onClick={() => unsubscribe(sub.repoName)}>
                  <Unsubscribe />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar src={`https://github.com/${sub.repoName.split('/')[0]}.png`} sx={{ background: 'white', borderRadius: '4px', padding: '2px' }} />
              </ListItemAvatar>
              <ListItemText primary={sub.repoName} secondary={fmt.format(new Date(sub.subscribedAt))} />
            </ListItem>
          ))}
        </List>
      </Container>
    </CustomPage>
  );
}
