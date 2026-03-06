import { DynamicOptionsLoadingProps } from 'next/dynamic';
import { ForwardedRef, forwardRef, ReactElement, RefAttributes } from 'react';
import './chartloader.scss';

export default forwardRef(function Loading ({}: DynamicOptionsLoadingProps, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <div ref={ref} className="w-full h-full flex items-center justify-center">
      <span className="chart-loader" />
    </div>
  );
}) as (props: DynamicOptionsLoadingProps & RefAttributes<HTMLDivElement>) => ReactElement;
