
declare module '*.svg' {
  import { FC, RefAttributes, SVGAttributes } from 'react';

  const Icon: FC<SVGAttributes<SVGSVGElement> & RefAttributes<SVGSVGElement>>;
  export default Icon;
}
