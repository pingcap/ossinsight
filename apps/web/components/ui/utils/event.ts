import { SyntheticEvent } from 'react';

export function preventDefault (ev: Event | SyntheticEvent<any>) {
  ev.preventDefault();
}
