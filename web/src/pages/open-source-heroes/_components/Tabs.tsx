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
  gap: 32px;
`;

export function TabItem ({ value, children }: { value: string, children: ReactNode }) {
  const { current, setCurrent } = useContext(TabsContext);

  return (
    <motion.li style={{ flex: 1, position: 'relative', whiteSpace: 'nowrap', padding: '0', borderBottom: '2px solid #53524F' }} initial={{ color: '#53524F' }} animate={value === current ? { color: '#FFE895' } : { color: '#53524F' }}>
      {(value === current) && <motion.div layout layoutId="active" style={{ zIndex: 0, pointerEvents: 'none', position: 'absolute', left: 0, bottom: -2, width: '100%', height: '2px', background: '#FFE895' }} />}
      <button style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '25px', lineHeight: '31px', fontWeight: 500, position: 'relative', color: 'currentcolor', background: 'none', appearance: 'none', border: 'none' }} type="button" onClick={() => setCurrent(value)}>
        {children}
      </button>
    </motion.li>
  );
}
