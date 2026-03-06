import { IconButton, Stack, useEventCallback } from '@mui/material';
import React from 'react';
import { ThumbDownAlt, ThumbDownOffAlt, ThumbUpAlt, ThumbUpOffAlt } from '@mui/icons-material';
import { useAsyncState } from '@/hooks/operation';
import { useRequireLogin } from '@/context/user';
import { cancelFeedback, feedback, pollFeedback } from '@/api/explorer';
import useQuestionManagement from '@/legacy-pages/explore/_components/useQuestion';
import { isNullish, nonEmptyArray, notNullish } from '@/utils/value';
import useSWR from 'swr';
import { useAuth0 } from '@auth0/auth0-react';
import { SxProps } from '@mui/system';

export default function Feedback ({ sx }: { sx?: SxProps }) {
  const { question } = useQuestionManagement();
  const { setAsyncData } = useAsyncState<boolean | undefined>(undefined);
  const requireLogin = useRequireLogin();
  const { isAuthenticated } = useAuth0();
  const { data: checked, mutate } = useSWR(isAuthenticated && notNullish(question) ? [question.id, 'question-feedback'] : undefined, {
    fetcher: async ([id]: [string, string]) => await requireLogin('explorer-feedback-button')
      .then(async oToken => await pollFeedback(id, oToken))
      .then(feedbacks => nonEmptyArray(feedbacks) ? Boolean(feedbacks[0].satisfied) : undefined),
    errorRetryCount: 0,
  });

  const handleUp = useEventCallback(() => {
    if (isNullish(question)) {
      return;
    }
    if (checked === true) {
      setAsyncData(requireLogin('explorer-feedback-button').then(async oToken =>
        await cancelFeedback(question.id, true, oToken)
          .finally(() => {
            void mutate(undefined);
          }),
      ));
    } else {
      setAsyncData(requireLogin('explorer-feedback-button').then(async oToken =>
        await feedback(question.id, { satisfied: true }, oToken)
          .finally(() => {
            void mutate(true);
          }),
      ));
    }
  });

  const handleDown = useEventCallback(() => {
    if (isNullish(question)) {
      return;
    }
    if (checked === false) {
      setAsyncData(requireLogin('explorer-feedback-button').then(async oToken =>
        await cancelFeedback(question.id, false, oToken)
          .finally(() => {
            void mutate(undefined);
          }),
      ));
    } else {
      setAsyncData(requireLogin('explorer-feedback-button').then(async oToken =>
        await feedback(question.id, { satisfied: false }, oToken)
          .finally(() => {
            void mutate(false);
          })),
      );
    }
  });

  return (
    <Stack sx={sx} direction="row" spacing={2}>
      <IconButton onClick={handleUp} color={checked === true ? 'primary' : undefined} size="small">
        {checked === true ? <ThumbUpAlt color="primary" fontSize="inherit" /> : <ThumbUpOffAlt fontSize="inherit" />}
      </IconButton>
      <IconButton onClick={handleDown} color={checked === false ? 'primary' : undefined} size="small">
        {checked === false ? <ThumbDownAlt color="primary" fontSize="inherit" /> : <ThumbDownOffAlt fontSize="inherit" />}
      </IconButton>
    </Stack>
  );
}
