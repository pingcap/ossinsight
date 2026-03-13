import { createElement, FC, Fragment } from 'react';
import { BuiltinWidgetsMap } from '../../builtin-widgets';
import { AvatarLabel } from './AvatarLabel';
import { AvatarProgress } from './AvatarProgress';
import { CardHeading } from './CardHeading';
import { BuiltinProps } from './common';
import { Empty } from './Empty';
import { Label } from './Label';
import { LabelValue } from './LabelValue';
import { ProgressBar } from './ProgressBar';

const map: { [K in keyof BuiltinWidgetsMap]: FC<BuiltinProps<K>> } = {
  'builtin:empty': Empty,
  'builtin:label-value': LabelValue,
  'builtin:card-heading': CardHeading,
  'builtin:avatar-label': AvatarLabel,
  'builtin:label': Label,
  'builtin:avatar-progress': AvatarProgress,
  'builtin:progress-bar': ProgressBar,
};

export function Builtin<K extends keyof BuiltinWidgetsMap> ({ name, ...props }: { name: K } & BuiltinProps<K>) {
  const Component = map[name];
  if (!Component) {
    return createElement(Fragment);
  }
  return createElement(Component, props as any);
}