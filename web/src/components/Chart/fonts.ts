import ChartJs from "chart.js/auto";
import { RefObject, useEffect } from "react";
import { useEventCallback } from "@mui/material";

export function useFonts(chartRef: RefObject<ChartJs>, family = 'JetBrains Mono') {
  const onLoad = useEventCallback((event: FontFaceSetLoadEvent) => {
    if (!family) {
      return;
    }
    if (event.fontfaces.find(ff => ff.family === family)) {
      chartRef.current.update('none');
    }
  });

  useEffect(() => {
    document.fonts.addEventListener('loadingdone', onLoad);
    return () => {
      document.fonts.removeEventListener('loadingdone', onLoad);
    };
  }, []);
}
