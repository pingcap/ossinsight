import { Card, CardContent, Drawer, Grow, IconButton, Popper, PopperProps, styled, Theme, Typography, useEventCallback, useMediaQuery } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { VirtualElement } from '@popperjs/core';
import { ArrowForward, HighlightOff } from '@mui/icons-material';
import { useLocalStorageState } from 'ahooks';
import { useExperimental } from '@site/src/components/Experimental';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { useSafeSetTimeout } from '@site/src/hooks/mounted';

export default function ExploreGlobalAds () {
  const [removed, setRemoved] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasClosed, setHasClosed] = useLocalStorageState<boolean>('ossinsight.explore.ads-has-closed', {
    serializer: String,
    deserializer: Boolean,
    defaultValue: false,
  });
  const [anchorEl, setAnchorEl] = useState<VirtualElement | null>(null);
  const [enabled] = useExperimental('explore-data');
  const location = useLocation();
  const safeSetTimeout = useSafeSetTimeout();

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  useEffect(() => {
    setAnchorEl(document.body);
    if (!enabled || hasClosed || /^\/explore\/?$/.test(location.pathname)) {
      return;
    }
    safeSetTimeout(() => {
      setRemoved(false);
      setOpen(true);
      setAnchorEl(document.querySelector('nav.navbar') ?? null);
    }, 2000);
  }, [enabled, hasClosed, location]);

  const handleClose = useEventCallback(() => {
    setOpen(false);
    setHasClosed(true);
    safeSetTimeout(() => {
      setRemoved(true);
    }, 400);
  });

  const content = (
    <CardContent sx={{ maxWidth: 402, mx: 'auto' }}>
      <Typography variant="body1" mb={1}>
        <StyledLink to="/explore" onClick={handleClose}>
          Data Explorer <StyledArrowForward fontSize="inherit" />
        </StyledLink>
        Unlock the power of 5+ billion Github data with our new <b>AI tool</b>, click here to start your journey!
      </Typography>
      <img src="/img/data-explorer-showcase.gif" width="370" height="231.5" alt="data-explorer-showcase" />
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
  background: linear-gradient(225deg, #4356FF 0%, #794BC5 106.06%);
  pointer-events: auto;
  border-radius: 12px;

  ${({ theme }) => theme.breakpoints.up('md')} {
    overflow: visible;

    &:after {
      display: block;
      content: ' ';
      position: absolute;
      top: -8px;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;

      border-bottom: 8px solid #5153e8;
    }
  }
`;

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    background: linear-gradient(225deg, #4356FF 0%, #794BC5 106.06%);
  }
`;

const CloseIcon = styled(IconButton)`
  position: absolute;
  right: 8px;
  top: 8px;
`;

const StyledArrowForward = styled(ArrowForward)`
  vertical-align: text-bottom;
`;

const StyledLink = styled(Link)`
  display: block;
  color: white !important;
  margin-bottom: 16px;
  font-weight: bold;
`;
