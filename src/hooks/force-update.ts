import { useDebugValue, useState } from 'react';
import { useEventCallback } from '@mui/material';

const debugFormat = (i: number) => `Force rendered ${i} times`;

export default function useForceUpdate () {
  const [i, setI] = useState(0);
  useDebugValue(i, debugFormat);

  return useEventCallback(() => {
    setI(i => i + 1);
  });
}
