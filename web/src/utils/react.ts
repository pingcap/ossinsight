import { ReactNode } from 'react';

export function reactNodeOrFunction<E = ReactNode, Args extends any[] = any[]> (reactNode: E | ((...args: Args) => E), ...args: Args) {
  if (reactNode instanceof Function) {
    return reactNode(...args);
  } else {
    return reactNode;
  }
}
