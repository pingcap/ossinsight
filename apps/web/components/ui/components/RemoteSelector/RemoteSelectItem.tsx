import { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';
import { RemoteSelectorListItemProps } from './RemoteSelector';

export function RemoteSelectItem (props: PropsWithChildren<Omit<RemoteSelectorListItemProps<any>, 'item'>>) {
  return (
    <li>
      <button
        className={twMerge(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-300 transition-[background-color,color,border-color] outline-none',
          'hover:bg-white/[0.04] hover:text-slate-100 focus-visible:bg-white/[0.06] focus-visible:text-slate-100',
          props.selected && 'bg-white/10 text-white',
        )}
        onClick={props.onClick}
        disabled={props.disabled || props.selected}
        data-selected={props.selected}
      >
        {props.children}
      </button>
    </li>
  );
}
