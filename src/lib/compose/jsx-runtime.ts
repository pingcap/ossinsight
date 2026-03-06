import { Layout } from '@/lib/widgets-utils/compose';
import Compose from './factory';
import JSX = Compose.JSX;
import FC = Compose.FC;


function jsx<K extends keyof Compose.JSX.IntrinsicElements> (component: K, props: Compose.JSX.IntrinsicElements[K]): Layout
function jsx<C extends FC<any>> (component: C, props: Parameters<C>[0]): ReturnType<C>;
function jsx (component: any, { children, ...props }: any): any {
  if (children != null) {
    if (!(children instanceof Array)) {
      children = [children];
    }
    return Compose(component, props, ...children);
  } else {
    return Compose(component, props);
  }
}

export type { JSX };
export { jsx, jsx as jsxs };
