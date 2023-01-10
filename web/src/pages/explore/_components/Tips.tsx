import { useLocalStorageState, useMemoizedFn } from 'ahooks';
import { DateTime } from 'luxon';
import { Card, CardContent, IconButton, Portal, Slide, styled, useEventCallback } from '@mui/material';
import React, { ForwardedRef, forwardRef, useState } from 'react';
import { Close } from '@mui/icons-material';
import Link from '@docusaurus/Link';
import { applyForwardedRef } from '@site/src/utils/ref';

export interface TipsRef {
  show: () => void;
}

export default forwardRef<TipsRef>(function Tips (_, forwardedRef: ForwardedRef<TipsRef>) {
  const [open, setOpen] = useState(false);

  const [tipsHistory, setTipsHistory] = useLocalStorageState<DateTime[]>('ossinsight.explore.tips-history', {
    serializer: dates => {
      return JSON.stringify(dates.map(date => date.toJSON()));
    },
    deserializer: (text) => {
      try {
        const data = JSON.parse(text);
        if (data instanceof Array) {
          return data.map(item => DateTime.fromISO(item)).filter(dt => dt.diffNow('days').days < 30);
        } else {
          return [];
        }
      } catch {
        return [];
      }
    },
    defaultValue: [],
  });

  const show = useMemoizedFn(() => {
    const couldShow = tipsHistory.length < 2;
    if (couldShow) {
      setOpen(true);
      setTipsHistory(tipsHistory => tipsHistory?.concat(DateTime.now()) ?? [DateTime.now()]);
    }
  });

  const handleClose = useEventCallback(() => {
    setOpen(false);
  });

  applyForwardedRef(forwardedRef, { show });

  return (
    <Portal>
      <Slide direction="left" in={open}>
        <Container>
          <BotIcon />
          <Spacer />
          <StyledCard>
            <CardContent>
              💗 Thank you for enjoying our answers.
              How about continue to <Link to="/blog/chat2query-tutorials" target="_blank">explore with your own dataset?</Link>
            </CardContent>
            <CloseButton size="small" onClick={handleClose}>
              <Close />
            </CloseButton>
          </StyledCard>
        </Container>
      </Slide>
    </Portal>
  );
});

const Container = styled('div')`
  position: fixed;
  top: 50vh;
  right: 16px;
  display: flex;
  flex-direction: row-reverse;

  ${({ theme }) => theme.breakpoints.down('md')} {
    flex-direction: column;
    align-items: flex-end;
  }
`;

const BotIcon = styled('div')`
  background: url("/img/bot.png") no-repeat center center;
  background-size: contain;
  width: 32px;
  height: 32px;
`;

const Spacer = styled('div')`
  width: 16px;
  height: 16px;
`;

const StyledCard = styled(Card)`
  background: #333333;
  max-width: 300px;
  position: relative;

  a {
    color: white;
    text-decoration: underline;
  }
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 8px;
  top: 8px;
`;
