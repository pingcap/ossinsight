import clsx from 'clsx';
import { formatNumber } from '@/lib/widgets-utils/utils';
import { BuiltinProps, useTheme } from './common';

export function LabelValue({
  className,
  style,
  label,
  value,
  colorScheme,
  labelProps = {},
  valueProps = {},
  column = true,
  tooltip = '',
  spliter,
  spliterProps = {},
  center = false,
}: BuiltinProps<'builtin:label-value'>) {
  const { Label, Value } = useTheme(colorScheme);

  return (
    <div
      className={clsx(className, 'group flex items-center gap-1', {
        'flex-col': column,
        'justify-center': center,
      })}
      style={{ zIndex: 1, ...style }}
    >
      <span
        style={{
          fontSize: 12,
          lineHeight: '16px',
          color: Label.color,
          overflow: 'visible',
          whiteSpace: 'nowrap',
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          ...labelProps.style,
        }}
        className={labelProps.className}
      >
        {typeof label === 'number' ? formatNumber(label) : label || ''}
        {tooltip && <LabelValueTooltip>{tooltip}</LabelValueTooltip>}
      </span>
      {spliter && (
        <span
          style={{
            fontSize: 12,
            lineHeight: 1,
            color: Label.color,
            overflow: 'visible',
            whiteSpace: 'nowrap',
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            ...spliterProps.style,
          }}
        >
          {spliter}
        </span>
      )}
      <span
        style={{
          fontSize: 24,
          lineHeight: 1,
          fontWeight: 'bold',
          color: Value.color,
          overflow: 'visible',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          ...valueProps.style,
        }}
        className={valueProps.className}
      >
        {typeof value === 'number' ? formatNumber(value) : value || ''}
        {valueProps?.tooltip && (
          <>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              className='w-4 h-4'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
              />
            </svg>
            <LabelValueTooltip arrow='right'>
              {valueProps.tooltip}
            </LabelValueTooltip>
          </>
        )}
      </span>
    </div>
  );
}

const LabelValueTooltip = (props: {
  children: React.ReactNode;
  arrow?: 'center' | 'left' | 'right';
}) => {
  const { children, arrow='center' } = props;
  return (
    <span
      className={clsx(
        'invisible group-hover:visible w-auto h-auto px-4 py-2 bg-[var(--background-color-tooltip)] text-[var(--text-color-tooltip)] rounded absolute text-sm top-[100%] left-0',
        'max-w-fit whitespace-break-spaces',
        `after:content-[' '] after:absolute after:top-0 after:top-[-10px] after:border-transparent after:border-b-[var(--background-color-tooltip)] after:border-solid after:border-[5px]`,
        {
          ['after:left-1/2']: arrow === 'center',
          ['after:left-2']: arrow === 'left',
          ['after:right-2']: arrow === 'right',
        }
      )}
    >
      {children}
    </span>
  );
};
