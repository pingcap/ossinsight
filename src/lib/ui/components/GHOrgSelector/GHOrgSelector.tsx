import { RemoteSelector, RemoteSelectorProps } from '../RemoteSelector';
import { GHOrgItem } from './GHOrgItem';
import { GHOrgListItem } from './GHOrgListItem';
import { getOrgText, isOrgEquals, searchOrg } from './utils';

export type RemoteOrgInfo = {
  id: number;
  login: string;
};

export interface GHOrgSelectorProps
  extends Pick<RemoteSelectorProps<any>, 'id' | 'renderInput'> {
  org: RemoteOrgInfo | undefined;
  onOrgSelected: (repo: RemoteOrgInfo | undefined) => void;
  compat?: boolean;
}

export function GHOrgSelector({
  org,
  onOrgSelected,
  compat,
  ...props
}: GHOrgSelectorProps) {
  return (
    <RemoteSelector<RemoteOrgInfo>
      {...props}
      getItemText={getOrgText}
      value={org ? [org] : []}
      onSelect={onOrgSelected}
      getRemoteOptions={searchOrg}
      renderSelectedItems={([item]) => (
        <GHOrgItem
          id={props.id}
          item={item}
          compat={compat}
          onClear={() => onOrgSelected(undefined)}
        />
      )}
      renderListItem={(props) => (
        <GHOrgListItem key={props.item.id} {...props} />
      )}
      equals={isOrgEquals}
      executeOnMount
    />
  );
}
