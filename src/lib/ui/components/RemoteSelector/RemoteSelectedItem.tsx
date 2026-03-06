import ClearIcon from 'bootstrap-icons/icons/x-circle-fill.svg';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface RemoteSelectedItemCommonProps {
  id?: string;
  onClear?: () => void;
  compat?: boolean;
}

export interface RemoteSelectedItemProps extends RemoteSelectedItemCommonProps {
  children: ReactNode;
}

export function RemoteSelectedItem ({ id, compat = false, onClear, children }: RemoteSelectedItemProps) {
  // TODO: Set id for button will trigger onClick when click the referencing label
  //       Find a way to focus but not click.
  return (
    <span className={twMerge(
      'flex items-center gap-4 border border-transparent',
      compat ? 'border-0' : 'py-1 px-2',
    )}>
      <span className="flex text-sm gap-2 items-center text-subtitle select-none">
        {children}
      </span>
       <button type="button" onClick={onClear} className="rounded-full opacity-50 hover:opacity-100 focus:opacity-100 shadow-gray-600 focus:shadow-control outline-none transition">
        <ClearIcon className="w-4 h-4 pointer-events-none" />
      </button>
    </span>
  );
}
