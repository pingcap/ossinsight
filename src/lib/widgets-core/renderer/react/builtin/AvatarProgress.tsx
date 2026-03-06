import clsx from 'clsx';
import { BuiltinProps, useTheme } from './common';
import { Wrapper } from './AvatarLabel';

export function AvatarProgress({
  className,
  style,
  label = '',
  imgSrc = '',
  value = 0,
  maxVal = 100,
  size = 20,
  colorScheme,
  backgroundColor,
  color,
  href,
  valueFormatter = (v: number) => `${v}`,
}: BuiltinProps<'builtin:avatar-progress'>) {
  const { Label } = useTheme(colorScheme);

  return (
    <Wrapper
      className={clsx(className, 'flex flex-row items-center', {
        ['gap-2']: !!label,
      })}
      style={style}
      href={href}
    >
        {imgSrc && (
          <div
            className={clsx(
              `bg-blackA3 inline-flex select-none items-center justify-center overflow-hidden rounded-full align-middle`,
            )}
            style={{
              height: `${size}px`,
              width: `${size}px`,
            }}
          >
            <img
              className='h-full w-full rounded-[inherit] object-cover'
              src={imgSrc}
              alt={label}
            />
          </div>
        )}
        <div
          className={clsx('grow flex flex-col justify-between', `h-[${size}px]`)}
        >
          <div className='flex justify-between'>
            <span
              style={{
                fontSize: 12,
                lineHeight: 1,
                fontWeight: 'bold',
                color: color || Label.color,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: 12,
                lineHeight: 1,
                fontWeight: 'bold',
                color: backgroundColor || Label.color,
              }}
            >
              {valueFormatter(value)}
            </span>
          </div>
          <div
            className={clsx('h-1 w-full', {
              'bg-[var(--scrollbar-track-color)]': !backgroundColor,
              [`bg-[${backgroundColor}]`]: backgroundColor,
            })}
            style={{
              backgroundColor: backgroundColor || 'var(--scrollbar-track-color)',
            }}
          >
            <div
              className={clsx('h-1', {
                'bg-primary': !color,
                [`bg-[${color}]`]: color,
              })}
              style={{
                width: `${(value / maxVal) * 100}%`,
                backgroundColor: color || 'var(--color-primary)',
              }}
            ></div>
          </div>
        </div>
      </Wrapper>
  );
}
