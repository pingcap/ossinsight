import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { ArrowForward, HighlightOff } from '@mui/icons-material';
import { Card, CardContent, Drawer, Grow, IconButton, Popper, PopperProps, styled, Theme, Typography, useEventCallback, useMediaQuery } from '@mui/material';
import { VirtualElement } from '@popperjs/core';
import { useSafeSetTimeout } from '@site/src/hooks/mounted';
import { useLocalStorageState } from 'ahooks';
import React, { useEffect, useState } from 'react';

export default function OpenSourceHeroesGlobalAds () {
  const [removed, setRemoved] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasClosed, setHasClosed] = useLocalStorageState<boolean>('ossinsight.open-source-heroes.ads-has-closed', {
    serializer: String,
    deserializer: Boolean,
    defaultValue: false,
  });
  const [anchorEl, setAnchorEl] = useState<VirtualElement | null>(typeof window === 'undefined' ? null : document.body);
  const location = useLocation();
  const safeSetTimeout = useSafeSetTimeout();

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  useEffect(() => {
    setAnchorEl(document.body);
    if (hasClosed || /^\/(?:blog|open-source-heroes)\/?$/.test(location.pathname)) {
      return;
    }
    safeSetTimeout(() => {
      setRemoved(false);
      setOpen(true);
      setAnchorEl(document.querySelector('nav.navbar') ?? null);
    }, 2000);
  }, [hasClosed, location]);

  const handleClose = useEventCallback(() => {
    setOpen(false);
    setHasClosed(true);
    safeSetTimeout(() => {
      setRemoved(true);
    }, 400);
  });

  const content = (
    <CardContent sx={{ maxWidth: 402, mx: 'auto' }}>
      <Typography variant="body1" mb={1} fontSize={12}>
        <StyledLink to="/open-source-heroes/" onClick={handleClose} sx={{ fontSize: 16 }}>
          Up to $2000 Serverless database credits <StyledArrowForward fontSize="inherit" />
        </StyledLink>
        Turn your GitHub contribution into free TiDB Cloud Serverless credits, start building and scaling with a plug&play database that supports both SQL and vector queries.
      </Typography>
      {open && <img style={{ marginTop: 12 }} src="/img/open-source-heroes-ads.png" width="536" alt="open-source-heroes-showcase" />}
    </CardContent>
  );

  return (
    <>
      {isSmall
        ? (
          <StyledDrawer open={open} anchor="bottom" onClose={handleClose}>
            {content}
          </StyledDrawer>
          )
        : (
          <Popper sx={{ zIndex: 15, pointerEvents: 'none' }} anchorEl={anchorEl} placement={isSmall ? 'bottom' : 'bottom-start'} open={!removed} keepMounted={false} popperOptions={popperOptions}>
            <Grow in={open} timeout={400} style={{ transformOrigin: '50% 0' }}>
              <StyledCard elevation={7}>
                {content}
                <CloseIcon size="small" onClick={handleClose}>
                  <HighlightOff />
                </CloseIcon>
              </StyledCard>
            </Grow>
          </Popper>
          )}
    </>
  );
}

const popperOptions: PopperProps['popperOptions'] = {
  strategy: 'fixed',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [16, 16],
      },
    },
  ],
};

const StyledCard = styled(Card)`
  position: relative;
  border: 15px solid #FFE895;
  background: #111111;
  pointer-events: auto;
  border-radius: 12px;

  ${({ theme }) => theme.breakpoints.up('md')} {
    overflow: visible;

    //&:after {
    //  display: block;
    //  content: ' ';
    //  position: absolute;
    //  top: -23px;
    //  left: 50%;
    //  width: 0;
    //  height: 0;
    //  border-left: 8px solid transparent;
    //  border-right: 8px solid transparent;
    //
    //  border-bottom: 8px solid #FFE895;
    //}
  }
`;

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    border-top: 6px solid #FFE895;
    background: #111111;
  }
`;

const CloseIcon = styled(IconButton)`
  color: #FFE895 !important;
  position: absolute;
  right: 8px;
  top: 8px;
`;

const StyledArrowForward = styled(ArrowForward)`
  vertical-align: text-bottom;
`;

const StyledLink = styled(Link)`
  display: block;
  text-align: center;
  color: #FFE895 !important;
  margin-bottom: 16px;
  font-weight: bold;
`;
