import { Divider, styled, useEventCallback } from '@mui/material';
import React from 'react';
import { ThumbDownAlt, ThumbDownOffAlt, ThumbUpAlt, ThumbUpOffAlt } from '@mui/icons-material';
import { useAsyncState } from '@site/src/hooks/operation';
import { useRequireLogin } from '@site/src/context/user';
import { cancelFeedback, feedback, pollFeedback } from '@site/src/api/explorer';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { isNullish, nonEmptyArray, notNullish } from '@site/src/utils/value';
import useSWR from 'swr';
import { useAuth0 } from '@auth0/auth0-react';
import { useExploreContext } from '@site/src/pages/explore/_components/context';
import { SxProps } from '@mui/system';

export default function Feedback ({ sx }: { sx?: SxProps }) {
  const { showTips } = useExploreContext();
  const { question } = useQuestionManagement();
  const { setAsyncData } = useAsyncState<boolean | undefined>(undefined);
  const requireLogin = useRequireLogin('explorer-feedback-button');
  const { isAuthenticated } = useAuth0();
  const { data: checked, mutate } = useSWR(isAuthenticated && notNullish(question) ? [question.id, 'question-feedback'] : undefined, {
    fetcher: async (id) => await requireLogin()
      .then(async oToken => await pollFeedback(id, oToken))
      .then(feedbacks => nonEmptyArray(feedbacks) ? Boolean(feedbacks[0].satisfied) : undefined),
    errorRetryCount: 0,
  });

  const handleUp = useEventCallback(() => {
    if (isNullish(question)) {
      return;
    }
    if (checked === true) {
      setAsyncData(requireLogin().then(async oToken =>
        await cancelFeedback(question.id, true, oToken)
          .finally(() => {
            void mutate(undefined);
          }),
      ));
    } else {
      setAsyncData(requireLogin().then(async oToken =>
        await feedback(question.id, { satisfied: true }, oToken)
          .finally(() => {
            void mutate(true);
          }),
      ));
    }
    showTips();
  });

  const handleDown = useEventCallback(() => {
    if (isNullish(question)) {
      return;
    }
    if (checked === false) {
      setAsyncData(requireLogin().then(async oToken =>
        await cancelFeedback(question.id, false, oToken)
          .finally(() => {
            void mutate(undefined);
          }),
      ));
    } else {
      setAsyncData(requireLogin().then(async oToken =>
        await feedback(question.id, { satisfied: false }, oToken)
          .finally(() => {
            void mutate(false);
          })),
      );
    }
  });

  return (
    <FeedbackContainer sx={sx}>
      <FeedbackButton onClick={handleUp}>
        {checked === true ? <ThumbUpAlt color="primary" fontSize="inherit" /> : <ThumbUpOffAlt fontSize="inherit" />}
      </FeedbackButton>
      <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
      <FeedbackButton onClick={handleDown}>
        {checked === false ? <ThumbDownAlt color="primary" fontSize="inherit" /> : <ThumbDownOffAlt fontSize="inherit" />}
      </FeedbackButton>
    </FeedbackContainer>
  );
}

const FeedbackContainer = styled('div')`
  display: inline-flex;
  pointer-events: auto;
  height: 32px;
  width: 65px;
  min-width: 65px;
  border-radius: 16px;
  background: #333333;
  align-items: center;
  justify-content: center;
`;

const FeedbackButton = styled('button')`
  width: 28px;
  height: 28px;
  appearance: none;
  outline: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  font-size: 20px;
  transition: ${({ theme }) => theme.transitions.create('color')};

  &:not(:disabled) {
    cursor: pointer;
  }
`;
