import { cloneElement, ForwardedRef, forwardRef, lazy, Suspense } from 'react';
import { WidgetReactVisualizationProps } from '../../types';
import Svg from './react-svg';

const ECharts = lazy(() => import('./echarts'));
const Compose = lazy(() => import('./compose'));

export interface WidgetVisualizationProxyProps extends WidgetReactVisualizationProps {
  noSuspense?: boolean
}

export default forwardRef(function WidgetVisualization ({ dynamicHeight, noSuspense = false, ...props }: WidgetVisualizationProxyProps, ref: ForwardedRef<any>) {
  let el;
  switch (props.type) {
    case 'echarts':
      el = <ECharts ref={ref} {...props} />;
      break;
    case 'react-svg':
      el = <Svg ref={ref} {...props} />;
      break;
    case 'compose':
      el = <Compose ref={ref} {...props} />;
      break;
    default:
      throw new Error(`visualize type '${props.type}' not supported.`);
  }

  if (dynamicHeight) {
    el = (
      <div className="overflow-x-hidden overflow-y-auto h-full w-full">
        {cloneElement(el, { ...props, style: { ...props.style, height: dynamicHeight } })}
      </div>
    );
  }

  if (!noSuspense) {
    el = (
      <Suspense fallback={<div className="overflow-x-hidden overflow-y-auto h-full w-full" ref={ref} />}>
        {el}
      </Suspense>
    );
  }

  return el;
});
