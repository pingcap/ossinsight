/** @jsxImportSource . */

import { BuiltinWidgetsMap } from '@/lib/widgets-core/renderer/builtin-widgets';
import { Layout } from '@/lib/widgets-utils/compose';
import Compose from './factory';
import JSX = Compose.JSX;

function createBuiltinWidget<K extends keyof BuiltinWidgetsMap> (key: K): Compose.FC<BuiltinWidgetsMap[K] & JSX.CommonAttributes> {
  return ({ gap, size, padding, grow, ...props }): Layout => {
    return (
      <widget widget={key} parameters={props} data={undefined} gap={gap} size={size} grow={gap} padding={padding} />
    );
  };
}

export const Label = createBuiltinWidget('builtin:label');
export const LabelValue = createBuiltinWidget('builtin:label-value');
export const AvatarLabel = createBuiltinWidget('builtin:avatar-label');
export const AvatarProgress = createBuiltinWidget('builtin:avatar-progress');
export const Empty = createBuiltinWidget('builtin:empty');
export const CardHeading = createBuiltinWidget('builtin:card-heading');
export const ProgressBar = createBuiltinWidget('builtin:progress-bar');
