import React, { ForwardedRef, forwardRef, PropsWithChildren } from 'react';
import { useInView } from 'react-intersection-observer';
import InViewContext from '../../components/InViewContext';
import useVisibility from '../../hooks/visibility';

import { Box, styled } from '@mui/material';

function Section ({
  children,
  id,
}: PropsWithChildren<{ id?: string }>, forwardedRef: ForwardedRef<HTMLElement>) {
  const visible = useVisibility();
  const { inView, ref } = useInView({ fallbackInView: true });

  return (
    <Box
      component="section"
      sx={{ py: 4 }}
      ref={forwardedRef}
      position="relative"
    >
      {id && <Anchor id={id} />}
      <div ref={ref}>
        <InViewContext.Provider value={{ inView: visible && inView }}>
          {children}
        </InViewContext.Provider>
      </div>
    </Box>
  );
}

export default forwardRef(Section);

const Anchor = styled('div')({
  display: 'block',
  position: 'relative',
  top: '-100px',
  width: 1,
});
