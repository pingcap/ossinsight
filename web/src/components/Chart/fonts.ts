import ChartJs from 'chart.js/auto';
import { RefObject, useEffect } from 'react';
import { useEventCallback } from '@mui/material';

export function useFonts (chartRef: RefObject<ChartJs<any, any, any> | undefined>, family = 'JetBrains Mono') {
  const onLoad = useEventCallback((event: FontFaceSetLoadEvent) => {
    if (!family) {
      return;
    }
    if (chartRef.current) {
      if (event.fontfaces.find(ff => ff.family === family) != null) {
        chartRef.current.update('none');
      }
    }
  });

  useEffect(() => {
    document.fonts.addEventListener('loadingdone', onLoad);
    return () => {
      document.fonts.removeEventListener('loadingdone', onLoad);
    };
  }, []);
}
