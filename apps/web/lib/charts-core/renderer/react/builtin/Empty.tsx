import clsx from 'clsx';
import { useMemo } from 'react';
import sad from '../../../icons/sad';
import { BuiltinProps } from './common';

export function Empty ({
  className,
  style,
  title = 'Oooops! It\'s a Blank Canvas.',
  colorScheme,
}: BuiltinProps<'builtin:empty'>) {
  const svgString = useMemo(() => sad(24, 'currentColor'), []);

  return (
    <div
      className={clsx(
        className,
        'flex flex-col items-center justify-center gap-2 text-white',
        colorScheme === 'light' ? 'text-black' : 'text-white',
      )}
      style={style}
    >
      <span className="flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgString }} />
      <span>{title}</span>
    </div>
  );
}
