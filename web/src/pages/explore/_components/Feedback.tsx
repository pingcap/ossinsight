import { Divider, styled, useEventCallback } from '@mui/material';
import React from 'react';
import { ThumbDownAlt, ThumbDownOffAlt, ThumbUpAlt, ThumbUpOffAlt } from '@mui/icons-material';
import { useAsyncState } from '@site/src/hooks/operation';
import { useRequireLogin } from '@site/src/context/user';
import { feedback, pollFeedback } from '@site/src/api/explorer';
import useQuestionManagement from '@site/src/pages/explore/_components/useQuestion';
import { isNullish, nonEmptyArray, notNullish } from '@site/src/utils/value';
import useSWR from 'swr';
import { useAuth0 } from '@auth0/auth0-react';
import { useExploreContext } from '@site/src/pages/explore/_components/context';

export default function Feedback () {
  const { showTips } = useExploreContext();
  const { question } = useQuestionManagement();
  const { loading, setAsyncData } = useAsyncState<boolean>(undefined);
  const requireLogin = useRequireLogin();
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
    setAsyncData(requireLogin().then(async oToken =>
      await feedback(question.id, { satisfied: true }, oToken)
        .finally(() => {
          void mutate(true);
        }),
    ));
    showTips();
  });

  const handleDown = useEventCallback(() => {
    if (isNullish(question)) {
      return;
    }
    setAsyncData(requireLogin().then(async oToken => await feedback(question.id, { satisfied: false }, oToken)
      .finally(() => {
        void mutate(true);
      })),
    );
  });

  return (
    <FeedbackContainer>
      <FeedbackButton disabled={checked === true || loading} onClick={handleUp}>
        {checked === true ? <ThumbUpAlt color="primary" fontSize="inherit" /> : <ThumbUpOffAlt fontSize="inherit" />}
      </FeedbackButton>
      <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
      <FeedbackButton disabled={checked === false || loading} onClick={handleDown}>
        {checked === false ? <ThumbDownAlt color="primary" fontSize="inherit" /> : <ThumbDownOffAlt fontSize="inherit" />}
      </FeedbackButton>
    </FeedbackContainer>
  );
}

const FeedbackContainer = styled('div')`
  display: inline-flex;
  height: 32px;
  width: 65px;
  min-width: 65px;
  border-radius: 16px;
  background: #333333;
  align-items: center;
  justify-content: center;
`;

interface FeedbackButtonProps {
  disabled: boolean;
}

const FeedbackButton = styled('button')<FeedbackButtonProps>`
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
