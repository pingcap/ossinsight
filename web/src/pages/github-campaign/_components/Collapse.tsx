import { Button, styled } from '@mui/material';
import { motion } from 'framer-motion';
import React, { type ReactNode, useState } from 'react';

export function Collapse ({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <CollapseRoot>
      <CollapseContainer initial={collapsed ? 'collapsed' : 'flatten'} animate={collapsed ? 'collapsed' : 'flatten'} variants={variants} transition={{ bounce: 0 }}>
        {children}
        <ShadowEffect variants={shadowEffectVariants} />
      </CollapseContainer>
      <Button sx={{ mt: 2 }} onClick={() => setCollapsed(collapsed => !collapsed)}>{collapsed ? 'Read more' : 'Collapse'}</Button>
    </CollapseRoot>
  );
}

const variants = {
  collapsed: { height: 240 },
  flatten: { height: 'auto' },
};

const shadowEffectVariants = {
  collapsed: { boxShadow: '0 0 40px 40px #141414' },
  flatten: { boxShadow: 'none' },
};

const CollapseRoot = styled('div')`
  border: 1px solid #565656;
  background: #141414;
  border-radius: 2px;
  padding: 56px;
`;

const CollapseContainer = motion(styled('div')`
  overflow: hidden;
  position: relative;
`);

const ShadowEffect = motion(styled('div')`
  position: absolute;
  left: 0;
  bottom: 0;
  content: ' ';
  display: block;
  width: 100%;
  height: 0;
`);
