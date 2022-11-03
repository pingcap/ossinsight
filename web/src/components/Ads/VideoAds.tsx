import React, { MouseEventHandler, useEffect, useState } from 'react';
import { Backdrop, css, IconButton, styled, useEventCallback } from '@mui/material';
import { Close } from '@mui/icons-material';
import AspectRatio from 'react-aspect-ratio';

export interface VideoAdsProps {
  thumbnailUrl: string;
  url: string;
  delay: number;
}

export default function VideoAds ({ thumbnailUrl, delay, url }: VideoAdsProps) {
  const [show, setShow] = useState(false);
  const [showButton, setShowButton] = useState(false);
  useEffect(() => {
    const h = setTimeout(() => {
      setShowButton(true);
    }, delay);
    return () => clearTimeout(h);
  }, []);

  const handleClick: MouseEventHandler = useEventCallback(() => {
    setShowButton(false);
    setShow(true);
  });

  const handleClickClose: MouseEventHandler = useEventCallback((event) => {
    setShowButton(false);
  });

  const handleClickMask: MouseEventHandler = useEventCallback(() => {
    setShow(false);
  });

  return (
    <>
      <Mask open={show} onClick={handleClickMask}>
        {show && (
          <VideoContainer ratio={16 / 9}>
            <iframe
              width="100%"
              height="100%"
              src={url}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </VideoContainer>
        )}
      </Mask>
      <VideoAdsContainer
        className={`${showButton ? 'show' : ''}`}
        onClick={handleClick}
      >
        <img width="100%" src={thumbnailUrl} alt="Video Thumbnail" />
        <CloseButton onClick={handleClickClose}>
          <Close />
        </CloseButton>
      </VideoAdsContainer>
    </>
  );
}

const VideoAdsContainer = styled('div', {
  name: 'VideoAdsContainer',
})(({ theme }) => css`
  position: fixed;
  z-index: 1000;
  right: ${theme.spacing(2)};
  bottom: ${theme.spacing(2)};
  width: min(400px, calc(100% - ${theme.spacing(2)} * 2));
  height: 225px;
  display: flex;
  align-content: flex-end;
  justify-content: center;
  box-shadow: ${theme.shadows[8]};
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow .2s ease, transform .7s ease, opacity .5s;
  opacity: 0;
  perspective: 700px;
  transform: rotateY(30deg) translateX(20px);
  pointer-events: none;

  &.show {
    opacity: 1;
    transform: initial;
    pointer-events: auto;
  }

  &:hover {
    box-shadow: ${theme.shadows[16]};
    transform: scale(1.01);
  }
`);

const CloseButton = styled(IconButton)`
  position: absolute;
  z-index: 1000;
  top: 4px;
  right: 4px
`;

const Mask = styled(Backdrop)`
  z-index: 9999;
`;

const VideoContainer = styled(AspectRatio)`
  width: min(100% - 32px, 560px);
`;
