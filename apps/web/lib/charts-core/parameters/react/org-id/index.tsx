import { RemoteSelectorInputProps } from '@/components/ui';
import {
  GHOrgSelector,
  RemoteOrgInfo,
} from '@/components/ui/components/GHOrgSelector';
import { useCallback, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { ParametersContext } from '../context';

export function OrgIdInput({
  id,
  value,
  onValueChange,
}: {
  id: string;
  value: number;
  onValueChange: (newValue: number | undefined) => void;
}) {
  const { linkedData } = useContext(ParametersContext);

  const handleOrgSelected = useCallback((org: RemoteOrgInfo | undefined) => {
    if (org) {
      linkedData.orgs[String(org.id)] = org;
    }
    onValueChange(org?.id);
  }, []);

  const org = linkedData.orgs[String(value)];

  return (
    <GHOrgSelector
      id={id}
      org={org}
      onOrgSelected={handleOrgSelected}
      renderInput={renderInput}
    />
  );
}

function renderInput(props: RemoteSelectorInputProps) {
  return (
    <Input className='min-w-[12rem] border-border bg-input' {...props} />
  );
}
