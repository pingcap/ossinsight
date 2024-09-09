import { styled } from '@mui/material';
import { motion } from 'framer-motion';
import React, { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

export const TabsContext = createContext<{ init: boolean, current: string, setCurrent: (value: string) => void }>({ init: false, current: '', setCurrent () {} });

export function Tabs ({ children, defaultValue }: { children: ReactNode, defaultValue: string }) {
  const [current, setCurrent] = useState(defaultValue);
  const [init, setInit] = useState(false);
  useEffect(() => {
    setInit(true);
  }, []);

  return (
    <TabsContext.Provider value={{ init, current, setCurrent }}>
      {children}
    </TabsContext.Provider>
  );
}

export const TabsList = styled('ul')`
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  padding: 0 24px;
  gap: 12px;
`;

export function TabItem ({ value, children }: { value: string, children: ReactNode }) {
  const { current, setCurrent } = useContext(TabsContext);

  return (
    <motion.li style={{ position: 'relative', padding: '8px 32px' }} initial={{ color: '#747474' }} animate={value === current ? { color: '#000000' } : { color: '#747474' }}>
      {(value === current) && <motion.div layout layoutId="active" style={{ zIndex: 0, pointerEvents: 'none', position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', background: '#FFE895', borderRadius: 9999 }} />}
      <button style={{ cursor: 'pointer', fontSize: '24px', fontWeight: 700, position: 'relative', color: 'currentcolor', background: 'none', appearance: 'none', border: 'none' }} type="button" onClick={() => setCurrent(value)}>
        {children}
      </button>
    </motion.li>
  );
}
