import { EChartsType } from 'echarts/types/dist/shared';
import { ForwardedRef, RefCallback, useCallback } from 'react';
import { useWebRTCRecorder } from './web-rtc';

export function useEChartsRecorder(echarts: ForwardedRef<EChartsType>, filename: string) {
  const { start, stop, recording, download, ref: canvasRef } = useWebRTCRecorder(filename);
  const ref: RefCallback<EChartsType> = useCallback((ec) => {
    canvasRef(ec?.getDom().querySelector('canvas') ?? null);
    if (echarts) {
      if (typeof echarts === 'function') {
        echarts(ec)
      } else {
        echarts.current = ec
      }
    }
  }, []);

  return { ref, start, stop, recording, download };
}