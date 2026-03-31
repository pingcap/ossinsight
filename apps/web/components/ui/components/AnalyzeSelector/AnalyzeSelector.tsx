import { useCallback } from 'react';
import { GHRepoSelector, RemoteRepoInfo } from '../GHRepoSelector';
import { GHUserSelector, RemoteUserInfo } from '../GHUserSelector';
import { GHOrgSelector, RemoteOrgInfo } from '../GHOrgSelector';
import { RemoteSelectorInputProps } from '../RemoteSelector';
import { Select, SelectItem } from '../Selector';
import { Input } from '@/components/ui/input';
import { AnalyzeTuple } from './types';

export interface AnalyzeSelectorProps {
  id?: string;
  tuple: AnalyzeTuple;
  onTupleChange: (tuple: AnalyzeTuple) => void;
}

export function AnalyzeSelector ({ id, tuple, onTupleChange }: AnalyzeSelectorProps) {
  const handleUserSelected = useCallback((user: RemoteUserInfo | undefined) => {
    onTupleChange({
      type: 'user',
      value: user,
    });
  }, [onTupleChange]);

  const handleRepoSelected = useCallback((repo: RemoteRepoInfo | undefined) => {
    onTupleChange({
      type: 'repo',
      value: repo,
    });
  }, [onTupleChange]);

  const handleOrgSelected = useCallback((org: RemoteOrgInfo | undefined) => {
    onTupleChange({
      type: 'org',
      value: org,
    });
  }, [onTupleChange]);

  const handleTypeChange = useCallback((type: 'user' | 'repo' | 'org') => {
    onTupleChange({
      type,
      value: undefined,
    });
  }, [onTupleChange]);

  return (
    <div className="flex min-w-0 items-stretch rounded-md border border-border bg-input shadow-sm">
      <Select className="Select-borderless min-w-[8.5rem]" value={tuple.type} onValueChange={handleTypeChange} position="popper">
        <SelectItem value={'user'}>
          User
        </SelectItem>
        <SelectItem value={'repo'}>
          Repository
        </SelectItem>
        <SelectItem value={'org'}>
          Organization
        </SelectItem>
      </Select>
      <span className="my-2 w-px flex-shrink-0 bg-border/80" />
      {tuple.type === 'user' && <GHUserSelector user={tuple.value} onUserSelected={handleUserSelected} compat renderInput={renderInput} />}
      {tuple.type === 'repo' && <GHRepoSelector repo={tuple.value} onRepoSelected={handleRepoSelected} compat renderInput={renderInput} />}
      {tuple.type === 'org' && <GHOrgSelector org={tuple.value} onOrgSelected={handleOrgSelected} compat renderInput={renderInput} />}
      <input className="sr-only" id={id} />
    </div>
  );
}

function renderInput (props: RemoteSelectorInputProps) {
  return (
    <Input
      {...props}
      className="h-auto min-w-0 flex-1 border-0 bg-transparent px-3 py-1.5 text-sm text-foreground shadow-none focus-visible:border-transparent focus-visible:ring-0"
      placeholder="Search..."
    />
  );
}
