import React, { CSSProperties, ForwardedRef, RefCallback, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import { EChartsReactProps } from 'echarts-for-react/src/types';
import EChartsReact, { EChartsInstance } from 'echarts-for-react';
import { AspectRatio } from 'react-aspect-ratio';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Opts } from 'echarts-for-react/lib/types';
import EChartsContext from './context';
import InViewContext from '../InViewContext';
import { coalesceFalsy, isFiniteNumber, isPositiveNumber, notNullish } from '@site/src/utils/value';
import * as echarts from 'echarts';

interface SizeProps {
  aspectRatio?: number;
  height?: number | string;
  echartsStyle?: CSSProperties;
}

export interface EChartsProps extends Exclude<EChartsReactProps, 'echarts'>, SizeProps {
  observe?: (element?: HTMLElement | null) => void;
}

const ECharts = React.forwardRef<EChartsReact, EChartsProps>(function ECharts ({
  aspectRatio,
  height,
  style,
  opts,
  echartsStyle: echartsStyleProp,
  observe,
  ...props
}, ref: ForwardedRef<EChartsReact>) {
  const realHeight = useMemo(() => {
    if (isPositiveNumber(aspectRatio)) {
      return '100%';
    } else {
      return coalesceFalsy(height, 400);
    }
  }, [aspectRatio, height]);

  const { inView } = useContext(InViewContext);

  const echartsStyle = useMemo(() => {
    const result: CSSProperties = Object.assign({}, echartsStyleProp);
    result.height = realHeight;
    result.width = '100%';
    result.overflow = 'hidden';
    return result;
  }, [style, aspectRatio, realHeight, inView]);

  const echartsOpts: Opts = useMemo(() => {
    return Object.assign({
      devicePixelRatio: typeof window === 'undefined' ? 1 : window.devicePixelRatio,
      renderer: 'canvas',
      height: 'auto',
      locale: 'en',
    }, opts);
  }, [opts, realHeight]);

  const { echartsRef } = useContext(EChartsContext);
  const [eRef, setERef] = useState<EChartsInstance>();

  const combinedRef: RefCallback<EChartsReact> = useCallback((instance) => {
    if (notNullish(echartsRef)) {
      echartsRef.current = instance ?? null;
    }
    setERef(instance);
    if (notNullish(ref)) {
      if (typeof ref === 'function') {
        ref(instance);
      } else {
        ref.current = instance;
      }
    }
    observe?.(instance?.ele ?? null);
  }, [ref, echartsRef, observe]);

  const fallback = useMemo(() => <EChartsPlaceholder aspectRatio={aspectRatio}
                                                     height={realHeight} />, [aspectRatio, realHeight]);

  useLayoutEffect(() => {
    eRef?.resize();
  }, [eRef]);

  return (
    <BrowserOnly fallback={fallback}>
      {() => {
        const child = (
          <EChartsReact
            {...props}
            opts={echartsOpts}
            style={echartsStyle}
            ref={combinedRef}
            theme="dark"
            echarts={echarts}
          />
        );

        if (isFiniteNumber(aspectRatio)) {
          return (
            <AspectRatio ratio={aspectRatio} style={style}>
              {child}
            </AspectRatio>
          );
        } else {
          return child;
        }
      }}
    </BrowserOnly>
  );
});

const EChartsPlaceholder = ({ height, aspectRatio }: SizeProps) => {
  if (isFiniteNumber(aspectRatio)) {
    return (
      <AspectRatio ratio={aspectRatio}>
        <div />
      </AspectRatio>
    );
  } else {
    return <div style={{ height: coalesceFalsy(height, 400), width: '100%' }} />;
  }
};

export default ECharts;
