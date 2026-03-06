import { useEffect } from 'react';
import { clearPromiseInterval, setPromiseInterval } from '../../../lib/promise-interval';

export function useInterval (method: () => Promise<void>, interval: number) {
  useEffect(() => {
    const h = setPromiseInterval(method, interval);
    return () => clearPromiseInterval(h);
  }, [method, interval]);
}
