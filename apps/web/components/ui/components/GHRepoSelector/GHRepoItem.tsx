import { GHAvatar } from '../GHAvatar';
import { RemoteSelectedItem, RemoteSelectedItemCommonProps } from '../RemoteSelector';
import { RemoteRepoInfo } from './GHRepoSelector';

export function GHRepoItem ({ item, ...props }: RemoteSelectedItemCommonProps & { item: RemoteRepoInfo }) {
  return (
    <RemoteSelectedItem {...props}>
      <GHAvatar name={item.fullName} size={4} />
      <span className="overflow-hidden whitespace-nowrap text-ellipsis">
        {item.fullName}
      </span>
    </RemoteSelectedItem>
  );
}
