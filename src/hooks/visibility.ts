import { useEffect, useState } from 'react';

export type UseVisibilityHook = () => boolean;

function useVisibilityCSR () {
  const [visibility, setVisibility] = useState(document.visibilityState !== 'hidden');

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibility(document.visibilityState !== 'hidden');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return visibility;
}

function useVisibilitySSR () {
  return true;
}

const useVisibility: UseVisibilityHook = typeof window === 'undefined' ? useVisibilitySSR : useVisibilityCSR;

export default useVisibility;
