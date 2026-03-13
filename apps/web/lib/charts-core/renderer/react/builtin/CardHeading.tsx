import clsx from 'clsx';
import { useId } from 'react';
import { BuiltinProps, useTheme } from './common';

export function CardHeading ({ className, style, title, subtitle, colorScheme }: BuiltinProps<'builtin:card-heading'>) {
  const id = useId();
  const { CardHeader } = useTheme(colorScheme);

  return (
    <div id={id} className={clsx(className, 'flex items-center', subtitle ? 'justify-between' : 'justify-center')} style={style}>
      <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 'bold', color: CardHeader.titleColor }}>
        {title}
      </span>
      {subtitle && <span style={{ fontSize: 12, lineHeight: 1, fontStyle: 'italic', color: CardHeader.subtitleColor }}>
        {subtitle}
      </span>}
    </div>
  );
}