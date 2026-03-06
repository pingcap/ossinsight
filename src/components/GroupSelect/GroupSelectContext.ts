import { createContext } from 'react';

export interface GroupSelectContextProps {
  group: string | undefined;
  setGroup: ((value: string | undefined) => void);
}

export default createContext<GroupSelectContextProps>({
  group: undefined,
  setGroup: () => {},
});
