import { GHAvatar } from '../GHAvatar';
import {
  RemoteSelectedItem,
  RemoteSelectedItemCommonProps,
} from '../RemoteSelector';
import { RemoteOrgInfo } from './GHOrgSelector';

export function GHOrgItem({
  item,
  ...props
}: RemoteSelectedItemCommonProps & { item: RemoteOrgInfo }) {
  return (
    <RemoteSelectedItem {...props}>
      <GHAvatar name={item.login} size={4} />
      <span className='overflow-hidden whitespace-nowrap text-ellipsis'>
        {item.login}
      </span>
    </RemoteSelectedItem>
  );
}
