import { ForwardedRef, forwardRef, ReactElement, RefAttributes } from 'react';

export default forwardRef(function Loading (_props, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center">
      <span className="chart-loader" aria-hidden="true" />
    </div>
  );
}) as (props: { [key: string]: any } & RefAttributes<HTMLDivElement>) => ReactElement;
