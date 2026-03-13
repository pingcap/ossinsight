import clsx from 'clsx';
import { BuiltinProps, useTheme } from './common';

export function ProgressBar({
  className,
  style,
  items = [],
}: BuiltinProps<'builtin:progress-bar'>) {
  return (
    <>
      <div className={clsx('relative flex items-center', className)} style={style}>
        <div className='overflow-hidden h-2 text-xs flex rounded w-full'>
          {items.map((item) => {
            return (
              <div
                style={{
                  width: `${item.percentage * 100}%`,
                  backgroundColor: item.color,
                }}
                className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center'
              ></div>
            );
          })}
        </div>
      </div>
    </>
  );
}
