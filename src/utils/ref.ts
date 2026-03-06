import { ForwardedRef } from 'react';

export function applyForwardedRef<T> (ref: ForwardedRef<T>, value: T) {
  if (ref != null) {
    if (typeof ref === 'function') {
      ref(value);
    } else {
      ref.current = value;
    }
  }
}
