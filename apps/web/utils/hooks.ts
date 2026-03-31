import { Ref, RefObject, useEffect, useState, useSyncExternalStore } from 'react';

export function useOnline () {
  return useSyncExternalStore(
    cb => {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('online', cb);

      return () => {
        window.removeEventListener('online', cb);
      };
    },
    () => typeof window !== 'undefined' ? window.navigator.onLine : true,
    () => true);
}

export function useDocumentVisible () {
  return useSyncExternalStore(
    cb => {
      if (typeof document === 'undefined') return () => {};
      document.addEventListener('visibilitychange', cb);
      return () => document.removeEventListener('visibilitychange', cb);
    },
    () => typeof document !== 'undefined' ? document.visibilityState !== 'hidden' : true,
    () => true,
  );
}

export function useVisible ({ current: ref }: RefObject<any>, defaultVisible = true) {
  const [visible, setVisible] = useState(defaultVisible);

  useEffect(() => {
    if (!ref) {
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      setVisible(entry.intersectionRatio > 0);
    });
    io.observe(ref);
    return () => {
      io.disconnect();
    };
  }, [ref]);

  return visible;
}
