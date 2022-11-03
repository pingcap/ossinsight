import 'react';
import 'grecaptcha';

declare module 'react' {
  interface CSSProperties {
    '--ifm-container-width-xl'?: string | number;
  }
  function forwardRef<T, P = {}> (
    render: (props: P, ref: Ref<T>) => ReactElement | null
  ): (props: P & RefAttributes<T>) => ReactElement | null;
}
