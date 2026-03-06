import { createContext } from 'react';

interface InViewContextProps {
  inView: boolean;
}

const InViewContext = createContext<InViewContextProps>({
  inView: true,
});

export default InViewContext;
