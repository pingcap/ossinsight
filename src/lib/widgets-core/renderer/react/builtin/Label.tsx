import clsx from 'clsx';
import { formatNumber } from '@/lib/widgets-utils/utils';
import { BuiltinProps, useTheme } from './common';

export function Label({ className, style, label, colorScheme, labelProps = {} }: BuiltinProps<'builtin:label-value'>) {
  const { Label } = useTheme(colorScheme);

  return (
    <div
      className={clsx(className, 'flex items-center justify-center')}
      style={style}
    >
      <span
        className={labelProps.className}
        style={{
          fontSize: 12,
          lineHeight: 1,
          color: Label.color,
          ...labelProps.style,
        }}
      >
        {typeof label === 'number' ? formatNumber(label) : label || ''}
      </span>
    </div>
  );
}