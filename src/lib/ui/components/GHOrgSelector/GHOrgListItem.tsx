import clsx from 'clsx';
import { GHAvatar } from '../GHAvatar';
import {
  RemoteSelectItem,
  RemoteSelectorListItemProps,
} from '../RemoteSelector';
import { RemoteOrgInfo } from './GHOrgSelector';

export function GHOrgListItem({
  item,
  ...props
}: RemoteSelectorListItemProps<RemoteOrgInfo>) {
  return (
    <RemoteSelectItem {...props}>
      <GHAvatar name={item.login} size={4} />
      <span className='overflow-hidden whitespace-nowrap text-ellipsis'>
        {item.login}
      </span>
    </RemoteSelectItem>
  );
}
