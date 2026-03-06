import { VisualizerModule } from '@ossinsight/widgets-types';
import { EChartsOption, EChartsType, init } from 'echarts';
import mergeRefs from 'merge-refs';
import { ForwardedRef, forwardRef, RefObject, useEffect, useRef, useState } from 'react';
import { LinkedData } from '../../parameters/resolver';
import { WidgetReactVisualizationProps } from '../../types';
import { createVisualizationContext, createWidgetContext } from '../../utils/context';
import '../echarts-map';
import '../echarts-theme';

interface EChartsComponentProps extends WidgetReactVisualizationProps {
  data: any;
  visualizer: VisualizerModule<'echarts', EChartsOption, any, any>;
  parameters: Record<string, string | string[]>;
  linkedData: LinkedData;
}

function EChartsComponent ({ className, style, data, visualizer, parameters, linkedData, colorScheme }: EChartsComponentProps, ref: ForwardedRef<HTMLDivElement>) {
  const echartsRef = useRef<EChartsType>();
  const containerRef = useRef<HTMLDivElement>(null);

  const size = useSize(containerRef);

  // create or resize echarts instance
  useEffect(() => {
    let ec = echartsRef.current;
    if (ec) {
      if (isAvailableSize(size)) {
        ec.resize(size);
      } else {
        ec.dispose();
        echartsRef.current = undefined;
      }
    } else if (isAvailableSize(size)) {
      ec = echartsRef.current = init(containerRef.current!, colorScheme === 'auto' ? 'dark' : colorScheme, {});
    }
  }, [size]);

  useEffect(() => {
    let ec = echartsRef.current;
    if (ec) {
      ec.dispose();
      ec = echartsRef.current = init(containerRef.current!, colorScheme === 'auto' ? 'dark' : colorScheme, {});
    }
  }, [colorScheme]);

  // dispose echarts instance if exists
  useEffect(() => {
    return () => {
      if (echartsRef.current) {
        echartsRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!isAvailableSize(size)) {
      return;
    }
    const { clientWidth: width, clientHeight: height } = containerRef.current!;

    const option = visualizer.default(data, {
      ...createVisualizationContext({ width, height, dpr: devicePixelRatio, colorScheme }),
      ...createWidgetContext('client', parameters, linkedData),
    });
    const eventHandlers = visualizer?.eventHandlers || [];
    echartsRef.current!.setOption(option);
    eventHandlers.forEach((eventHandler) => {
      echartsRef.current!.on(
        eventHandler.type,
        eventHandler.query,
        eventHandler.handler
      );
    });
  }, [data, visualizer, parameters, colorScheme, isAvailableSize(size)]);

  return (
    <div
      className={className}
      style={style}
      ref={mergeRefs(containerRef, ref)}
    />
  );
}

const INITIAL_SIZE = { width: 0, height: 0 };

function useSize (ref: RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState(INITIAL_SIZE);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      const ro = new ResizeObserver(([entry]) => {
        setSize(entry.contentRect);
      });

      ro.observe(el);
      return () => ro.disconnect();
    }
  }, []);

  return size;
}

function isAvailableSize (size: typeof INITIAL_SIZE) {
  return size.width > 0 && size.height > 0;
}

export default forwardRef(EChartsComponent);
