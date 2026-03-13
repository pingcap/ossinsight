import { GHAvatar } from '../GHAvatar';
import { RemoteSelectItem, RemoteSelectorListItemProps } from '../RemoteSelector';
import { RemoteRepoInfo } from './GHRepoSelector';

export function GHRepoListItem ({ item, ...props }: RemoteSelectorListItemProps<RemoteRepoInfo>) {
  return (
    <RemoteSelectItem {...props}>
      <GHAvatar name={item.fullName} size={4} />
      <span className="overflow-hidden whitespace-nowrap text-ellipsis">
        {item.fullName}
      </span>
    </RemoteSelectItem>
  );
}