import { styled } from '@mui/material';
import { motion } from 'framer-motion';
import React, { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';

export const TabsContext = createContext<{ init: boolean, current: string, setCurrent: (value: string) => void }>({ init: false, current: '', setCurrent () {} });

export function Tabs ({ children, defaultValue, values }: { children: ReactNode, defaultValue: string, values: string[] }) {
  const [current, setCurrent] = useState(defaultValue);
  const [init, setInit] = useState(false);
  const [clicking, setClicking] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInit(true);

    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(([entry]) => {
        setInView(entry.isIntersecting);
      }, { threshold: 0.3 });
      io.observe(el);
      return () => {
        io.unobserve(el);
      };
    } else {
      setInView(true);
    }
  }, []);

  useEffect(() => {
    if (clicking) {
      const timeout = setTimeout(() => {
        setClicking(0);
      }, 5000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [clicking]);

  useEffect(() => {
    if (!clicking && inView) {
      const interval = setInterval(() => {
        setCurrent(value => {
          const index = Math.max(values.indexOf(value), 0);
          return values[(index + 1) % values.length];
        });
      }, 4000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [clicking, inView]);

  return (
    <div ref={ref} onMouseDown={() => setClicking(clicking => clicking + 1)}>
      <TabsContext.Provider value={{ init, current, setCurrent }}>
        {children}
      </TabsContext.Provider>
    </div>
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
