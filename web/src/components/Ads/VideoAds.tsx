import React, { MouseEventHandler, useEffect, useState } from 'react';
import { Backdrop, css, IconButton, styled, useEventCallback } from '@mui/material';
import { Close } from '@mui/icons-material';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import AspectRatio from 'react-aspect-ratio';

export interface VideoAdsProps {
  thumbnailUrl: string;
  url: string;
  delay: number;
}

function isSessionClosed (url) {
  const item = sessionStorage.getItem('video-ads:' + btoa(url));
  return item === 'true';
}

function setSessionClosed (url) {
  sessionStorage.setItem('video-ads:' + btoa(url), 'true');
}

export default function VideoAds ({ thumbnailUrl, delay, url }: VideoAdsProps) {
  const [show, setShow] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const h = setTimeout(() => {
      if (!isSessionClosed(url)) {
        setShowButton(true);
      }
    }, process.env.NODE_ENV === 'development' ? 0 : delay);
    return () => clearTimeout(h);
  }, []);

  const handleClick: MouseEventHandler = useEventCallback(() => {
    setShow(true);
  });

  const handleClickClose: MouseEventHandler = useEventCallback((event) => {
    setShowButton(false);
    setShow(false);
    setSessionClosed(url);
    event.stopPropagation();
  });

  const handleClickMask: MouseEventHandler = useEventCallback(() => {
    setShow(false);
  });

  return (
    <>
      <Mask open={show} onClick={handleClickMask}>
        {show && (
          <VideoContainer ratio={16 / 9}>
            <div>
              <CloseButton onClick={handleClickClose}>
                <Close />
              </CloseButton>
              <iframe
                width="100%"
                height="100%"
                src={url}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </VideoContainer>
        )}
      </Mask>
      <VideoAdsContainer
        ratio={16 / 9}
        className={`${showButton ? 'show' : ''}`}
      >
        <div onClick={handleClick}>
          <img width="100%" src={thumbnailUrl} alt="Video Thumbnail" />
          <PlayIconContainer>
            <PlayCircleRoundedIcon fontSize="inherit" opacity={0.3} />
          </PlayIconContainer>
          <CloseButton onClick={handleClickClose}>
            <Close />
          </CloseButton>
        </div>
      </VideoAdsContainer>
    </>
  );
}

const VideoAdsContainer = styled(AspectRatio, {
  name: 'VideoAdsContainer',
})(({ theme }) => css`
  position: fixed;
  z-index: 1000;
  right: ${theme.spacing(2)};
  bottom: ${theme.spacing(2)};
  width: min(300px, calc(100% - ${theme.spacing(2)} * 2));
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
  transform: rotateX(15deg) rotateY(15deg) translateX(20px);
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
  width: min(100% - 32px, 1080px, 100vh / 9 * 16 - 32px);
`;

const PlayIconContainer = styled('div')`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 128px;
  background-color: rgba(0, 0, 0, 0.4);
`;
