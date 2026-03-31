import ClearIcon from 'bootstrap-icons/icons/x-circle-fill.svg';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';

export interface RemoteSelectedItemCommonProps {
  id?: string;
  onClear?: () => void;
  compat?: boolean;
}

export interface RemoteSelectedItemProps extends RemoteSelectedItemCommonProps {
  children: ReactNode;
}

export function RemoteSelectedItem ({ id, compat = false, onClear, children }: RemoteSelectedItemProps) {
  return (
    <span className={twMerge(
      'inline-flex items-center gap-2.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.88)]',
      compat ? 'border-0 bg-transparent px-0 py-0 shadow-none' : undefined,
    )}>
      <span className="flex min-w-0 items-center gap-2 text-sm text-slate-200 select-none">
        {children}
      </span>
      <Button
        type="button"
        onClick={onClear}
        variant="ghost"
        size="icon-xs"
        className="shrink-0 rounded-full text-[#8f91a1] hover:bg-white/[0.06] hover:text-white"
      >
        <ClearIcon className="w-4 h-4 pointer-events-none" />
      </Button>
    </span>
  );
}
