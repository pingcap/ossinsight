import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { useRecentHotCollections } from './hook';
import { useScrollable } from './useScrollable';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import HotCollection, { LoadingHotCollection } from '@site/src/components/HotCollection';
import { isNullish, notFalsy } from '@site/src/utils/value';

import { Box, Stack } from '@mui/material';

export default function Collections () {
  const { data } = useRecentHotCollections();
  const version = useRef(0);

  return (
    <CollectionsContainer version={++version.current}>
      {data?.data.slice(0, 10).map(({ id, name, repos, collectionRepos }) => (
        <HotCollection key={id} variant='link' name={name} repos={repos} collectionRepos={collectionRepos} />
      ))}
      {isNullish(data) ? <Loading /> : undefined}
    </CollectionsContainer>
  );
}

const Loading = () => {
  return (
    <>
      <LoadingHotCollection />
      <LoadingHotCollection />
      <LoadingHotCollection />
    </>
  );
};

const CollectionsContainer = ({ version, children }: PropsWithChildren<{ version: number }>) => {
  const { ref, scrollable, scroll, recompute } = useScrollable({ direction: 'x' });

  useEffect(() => {
    recompute();
  }, [version]);

  return (
    <Box position="relative">
      <ScrollIndicator type="backward" onClick={() => scroll(-0.6)} show={notFalsy(scrollable) && scrollable !== 'forward'} />
      <ScrollIndicator type="forward" onClick={() => scroll(0.6)} show={notFalsy(scrollable) && scrollable !== 'backward'} />
      <Stack direction="row" overflow="auto" ref={ref}>
        {children}
      </Stack>
    </Box>
  );
};

type ScrollIndicatorProps = { type: 'forward' | 'backward', onClick: () => void, show: boolean };
const ScrollIndicator = ({ type, onClick, show }: ScrollIndicatorProps) => {
  return (
    <Box
      sx={{
        transition: 'opacity .2s ease',
        cursor: 'pointer',
        opacity: show ? 1 : 0,
        pointerEvents: show ? undefined : 'none',
        zIndex: 1,
      }}
      position="absolute"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="24px"
      top={0}
      left={type === 'backward' ? 0 : undefined}
      right={type === 'forward' ? 0 : undefined}
      onClick={onClick}
      bgcolor="#2c2c2c"
      border="2px dashed #3c3c3c"
      fontSize={36}
    >
      {type === 'forward' ? <ArrowRightIcon fontSize="inherit" /> : <ArrowLeftIcon fontSize="inherit" />}
    </Box>
  );
};
