import { PropsWithChildren } from 'react';
import { RemoteSelectorListItemProps } from './RemoteSelector';

export function RemoteSelectItem (props: PropsWithChildren<Omit<RemoteSelectorListItemProps<any>, 'item'>>) {
  return (
    <li className="RemoteSelectItem">
      <button
        className="RemoteSelectItem-button"
        onClick={props.onClick}
        disabled={props.disabled || props.selected}
        data-selected={props.selected}
      >
        {props.children}
      </button>
    </li>
  );
}