import { useEventCallback } from '@mui/material';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import InViewContext from '../../components/InViewContext';

export default function Section({
  children,
  id,
  onShow,
}: PropsWithChildren<{ id?: string, onShow?: (id: string, show: boolean) => void }>) {
  const { inView, ref } = useInView({ fallbackInView: true });

  return (
    <Box
      component="section"
      sx={{ py: 4 }}
      ref={ref}
      position="relative"
    >
      {id && <Anchor id={id} />}
      <InViewContext.Provider value={{ inView }}>
        {children}
      </InViewContext.Provider>
    </Box>
  );
}

const Anchor = styled('div')({
  display: 'block',
  position: 'relative',
  top: '-100px',
  width: 1,
});
