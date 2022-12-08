import CustomPage from '@site/src/theme/CustomPage';
import React, { useCallback } from 'react';
import { useSubscriptions } from '@site/src/api/user';
import { Avatar, Box, Button, CircularProgress, Container, FormControl, FormHelperText, IconButton, List, ListItem, ListItemAvatar, ListItemText, Skeleton, Typography } from '@mui/material';
import { clientWithoutCache } from '@site/src/api/client';
import { Unsubscribe } from '@mui/icons-material';
import EnableEmailSwitch from '@site/src/pages/subscriptions/EnableEmailSwitch';
import { useNotifications } from '@site/src/components/Notifications';
import { useUserInfoContext } from '@site/src/context/user';

const fmt = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

export default function () {
  const { validating: userValidating, validated: userValidated, login } = useUserInfoContext();

  return (
    <CustomPage>
      <Container maxWidth="sm" sx={{ pt: 6, pb: 12 }}>
        <Typography variant="h1" mb={4}>
          My Subscriptions
        </Typography>
        {!userValidated && (
          <Button
            variant="contained"
            disabled={userValidating}
            startIcon={userValidating && <CircularProgress size={12} />}
            onClick={login}
          >
            Sign in
          </Button>
        )}
        {userValidated && (
          <Subscriptions />
        )}
      </Container>
    </CustomPage>
  );
}

function Subscriptions () {
  const { data = [], mutate, isValidating } = useSubscriptions();
  const { success, displayError } = useNotifications();

  const unsubscribe = useCallback(function (name: string) {
    clientWithoutCache.put(`/repos/${name}/unsubscribe`, undefined, { withCredentials: true })
      .then(async () => await mutate())
      .then(() => success(`Cancelled getting updates from ${name}`))
      .catch(displayError);
  }, [mutate]);

  return (
    <>
      <FormControl>
        <EnableEmailSwitch />
        <FormHelperText>
          Control whether to receive emails from OSS Insight
        </FormHelperText>
      </FormControl>
      {!isValidating && data.length === 0 && (
        <Typography variant="h2" sx={{ mt: 4 }} color="text.disabled">You have no subscriptions yet</Typography>
      )}
      <List
        sx={{ mt: 4 }}
        subheader={(
          <Box>
            <Typography variant="h3" mb={1}>Manage the subscribed repositories list</Typography>
            <Typography variant="body2">If you unsubscribe from a repository, we will no longer send emails related to that repository</Typography>
          </Box>
        )}
      >
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
    </>
  );
}
