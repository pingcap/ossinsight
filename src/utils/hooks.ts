import { Ref, RefObject, useEffect, useState, useSyncExternalStore } from 'react';

export function useOnline () {
  return useSyncExternalStore(
    cb => {
      window.addEventListener('online', cb);

      return () => {
        window.removeEventListener('online', cb);
      };
    },
    () => window.navigator.onLine,
    () => true);
}

export function useDocumentVisible () {
  return useSyncExternalStore(
    cb => {
      document.addEventListener('visibilitychange', cb);
      return () => document.removeEventListener('visibilitychange', cb);
    },
    () => document.visibilityState !== 'hidden',
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
