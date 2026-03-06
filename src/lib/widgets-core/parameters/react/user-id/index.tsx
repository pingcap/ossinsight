import { GHRepoSelector, RemoteRepoInfo, RemoteSelectorInputProps } from '@/lib/ui';
import { GHUserSelector, RemoteUserInfo } from '@/lib/ui/components/GHUserSelector';
import { useCallback, useContext } from 'react';
import { ParametersContext } from '../context';

export function UserIdInput ({ id, value, onValueChange }: { id: string, value: number, onValueChange: (newValue: number | undefined) => void }) {
  const { linkedData } = useContext(ParametersContext);

  const handleUserSelected = useCallback((user: RemoteUserInfo | undefined) => {
    if (user) {
      linkedData.users[String(user.id)] = user;
    }
    onValueChange(user?.id);
  }, []);

  const user = linkedData.users[String(value)];

  return (
    <GHUserSelector
      id={id}
      user={user}
      onUserSelected={handleUserSelected}
      renderInput={renderInput}
    />
  );
}

function renderInput (props: RemoteSelectorInputProps) {
  return <input className="TextInput" {...props}
                type={(props as any).type === 'button' ? undefined : (props as any).type} />;
}