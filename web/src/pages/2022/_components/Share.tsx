import React, { useCallback, useEffect, useState } from 'react';
import ShareIcon from '@mui/icons-material/Share';
import { LinkedinIcon, RedditIcon, TelegramIcon } from 'react-share';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useHistory } from '@docusaurus/router';
import {
  useEventCallback,
  SpeedDial,
  styled,
  SpeedDialAction,
  ButtonBase,
  Stack,
  Box,
  Divider,
} from '@mui/material';
import { linkedinLink, redditLink, telegramLink, twitterLink } from '@site/src/utils/share';
import { Twitter } from '@mui/icons-material';

function jump (link: string) {
  window.open(link, '_blank');
}

export default function Share () {
  const [show, setShow] = useState(false);
  const { siteConfig } = useDocusaurusContext();
  const { createHref } = useHistory();

  const url = useCallback(() => {
    return siteConfig.url + createHref(location);
  }, []);

  const title = useCallback(() => {
    return document.title;
  }, []);

  useEffect(() => {
    const handler = () => {
      setShow(window.scrollY > 100);
    };
    document.addEventListener('scroll', handler);
    return () => {
      document.removeEventListener('scroll', handler);
    };
  }, []);

  return (
    <ShareContainer
      justifyContent="space-between"
      alignItems="center"
      sx={{
        opacity: show ? undefined : 0,
      }}
    >
      <Box minHeight={56} width="100%" position="relative">
        <SpeedDial
          sx={{
            position: 'absolute',
            left: 0,
            bottom: 0,
          }}
          ariaLabel="Share"
          FabProps={{
            disableRipple: true,
            sx: {
              background: 'transparent !important',
              boxShadow: 'none !important',
              color: 'white',
            },
          }}
          icon={<ShareIcon />}
        >
          <SpeedDialAction
            sx={{ overflow: 'hidden' }}
            icon={<LinkedinIcon />}
            onClick={useEventCallback(() => jump(linkedinLink(url(), { title: title() })))}
          />
          <SpeedDialAction
            sx={{ overflow: 'hidden' }}
            icon={<RedditIcon />}
            onClick={useEventCallback(() => jump(redditLink(url(), { title: title() })))}
          />
          <SpeedDialAction
            sx={{ overflow: 'hidden' }}
            icon={<TelegramIcon />}
            onClick={useEventCallback(() => jump(telegramLink(url(), { title: title() })))}
          />
        </SpeedDial>
      </Box>
      <Divider flexItem orientation="horizontal" sx={{ mx: 1 }} />
      <ButtonBase
        sx={{ width: 56, height: 56 }}
        onClick={useEventCallback(() => jump(twitterLink(url(), { title: title() })))}>
        <Twitter />
      </ButtonBase>
    </ShareContainer>
  );
}

const ShareContainer = styled(Stack)({
  opacity: 0.4,
  position: 'fixed',
  zIndex: 1100,
  bottom: 32,
  right: 16,
  width: 56,
  height: 112,
  borderRadius: 28,
  background: 'transparent linear-gradient(180deg, #EA7E53 0%, #3E2A75 100%) 0% 0% no-repeat padding-box',
  transition: 'opacity .25s',
  '&:hover': {
    opacity: 1,
  },
});
