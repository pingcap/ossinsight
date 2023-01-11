import { FabProps, SpeedDial, SpeedDialAction, speedDialClasses, styled, useEventCallback } from '@mui/material';
import { Share } from '@mui/icons-material';
import React from 'react';
import { useExploreContext } from '@site/src/pages/explore/_components/context';
import { LinkedinIcon, RedditIcon, TelegramIcon, TwitterIcon } from 'react-share';
import { linkedinLink, redditLink, telegramLink, twitterLink } from '@site/src/utils/share';
import { useMemoizedFn } from 'ahooks';

// twitter linkedin reddit telegram

interface ShareButtonsProps {
  url: string;
  title: string;
  summary?: string;
  hashtags: string[];
}

export default function ShareButtons ({ url, title, summary, hashtags }: ShareButtonsProps) {
  const { showTips } = useExploreContext();

  const jump = useMemoizedFn((url: string) => {
    showTips();
    window.open(url, '_blank');
  });

  return (
    <ButtonContainer>
      <SpeedDial
        ariaLabel="share"
        sx={{
          display: 'inline-block',
          position: 'absolute',
          right: 0,
          top: 0,
          [`.${speedDialClasses.actions}`]: {
            width: 64,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          },
        }}
        icon={(
          <span>
            Share
            <Share fontSize="inherit" />
          </span>
        )}
        FabProps={triggerFabProps}
      >
        <SpeedDialAction
          sx={{ overflow: 'hidden' }}
          icon={<TwitterIcon />}
          FabProps={fabProps}
          onClick={useEventCallback(() => jump(twitterLink(url, { title, hashtags })))}
        />
        <SpeedDialAction
          sx={{ overflow: 'hidden' }}
          icon={<LinkedinIcon />}
          FabProps={fabProps}
          onClick={useEventCallback(() => jump(linkedinLink(url, { title, summary })))}
        />
        <SpeedDialAction
          sx={{ overflow: 'hidden' }}
          icon={<RedditIcon />}
          FabProps={fabProps}
          onClick={useEventCallback(() => jump(redditLink(url, { title })))}
        />
        <SpeedDialAction
          sx={{ overflow: 'hidden' }}
          icon={<TelegramIcon />}
          FabProps={fabProps}
          onClick={useEventCallback(() => jump(telegramLink(url, { title })))}
        />
      </SpeedDial>
    </ButtonContainer>
  );
}

const triggerFabProps: FabProps = {
  color: 'inherit',
  disableRipple: true,
  sx: {
    fontFamily: 'var(--ifm-heading-font-family)',
    textTransform: 'unset',
    fontSize: 16,
    fontWeight: 'normal',
    width: 68,
    height: 32,
    minHeight: 32,
    background: 'none',
    boxShadow: 'none !important',
    pr: 0.5,
    '> span': {
      display: 'inline-flex',
      gap: 0.5,
      alignItems: 'center',
    },
    '&:hover, &:active': {
      background: 'none',
    },
  },
};

const fabProps: FabProps = {
  sx: {
    width: 32,
    height: 32,
    minHeight: 32,
    borderRadius: 16,
    mx: 0,
    overflow: 'hidden',
  },
};

const ButtonContainer = styled('div')`
  display: inline-block;
  position: relative;
  width: 64px;
  height: 32px;
  line-height: 32px;
`;
