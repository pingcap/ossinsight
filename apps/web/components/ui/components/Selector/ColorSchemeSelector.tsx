import SunIcon from 'bootstrap-icons/icons/sun.svg';
import MoonIcon from 'bootstrap-icons/icons/moon.svg';
import * as React from 'react';
import { useSimpleSelect } from './Select';

const options = [
  {
    key: 'auto',
    title: (
      <span className="flex gap-1 rounded px-2 py-0.5 items-center text-primary text-xs font-bold min-w-[6em]">
        Auto Mode
      </span>
    ),
  },
  {
    key: 'dark',
    title: (
      <span className="flex gap-1 rounded px-2 py-0.5 items-center bg-gray-950 text-white text-xs font-bold min-w-[6em]">
        <MoonIcon className='text-primary' width={12} height={12} />
        Dark Mode
      </span>
    ),
  },
  {
    key: 'light',
    title: (
      <span className="flex gap-1 rounded px-2 py-0.5 items-center bg-primary text-gray-950 text-xs font-bold  min-w-[6em]">
        <SunIcon width={12} height={12} />
        Light Mode
      </span>
    ),
  },
];

export interface ColorSchemeSelectorProps {
  id?: string;
  onValueChange?: (newValue: string) => void;
  enums?: string[];
  showLabel?: boolean;
  value?: string;
}

export function ColorSchemeSelector (props: ColorSchemeSelectorProps) {
  const { onValueChange, id, value = 'auto' } = props;

  const { select: colorSchemeSelect, value: colorScheme } = useSimpleSelect(
    options,
    options.find((i) => i.key === value) ||
    options[0],
    id,
  );

  React.useEffect(() => {
    onValueChange && onValueChange(colorScheme);
  }, [colorScheme]);

  return <>{colorSchemeSelect}</>;
}
