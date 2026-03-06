import { RemoteSelector, RemoteSelectorProps } from '../RemoteSelector';
import { GHRepoItem } from './GHRepoItem';
import { GHRepoListItem } from './GHRepoListItem';
import { getRepoText, isRepoEquals, searchRepo } from './utils';

export type RemoteRepoInfo = {
  id: number
  fullName: string
  defaultBranch: string
}

export interface GHRepoSelectorProps extends Pick<RemoteSelectorProps<any>, 'id' | 'renderInput'> {
  repo: RemoteRepoInfo | undefined;
  onRepoSelected: (repo: RemoteRepoInfo | undefined) => void;
  compat?: boolean;
}

export function GHRepoSelector ({ repo, onRepoSelected, compat, ...props }: GHRepoSelectorProps) {
  return (
    <RemoteSelector<RemoteRepoInfo>
      {...props}
      getItemText={getRepoText}
      value={repo ? [repo] : []}
      onSelect={onRepoSelected}
      getRemoteOptions={searchRepo}
      renderSelectedItems={([item]) => <GHRepoItem id={props.id} item={item} compat={compat} onClear={() => onRepoSelected(undefined)} />}
      renderListItem={props => <GHRepoListItem key={props.item.id} {...props} />}
      equals={isRepoEquals}
    />
  );
}
