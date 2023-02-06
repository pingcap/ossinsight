import { ReactNode } from 'react';

export function reactNodeOrFunction<Args extends any[]> (reactNode: ReactNode | ((...args: Args) => ReactNode), ...args: Args) {
  if (typeof reactNode === 'function') {
    return reactNode(...args);
  } else {
    return reactNode;
  }
}
