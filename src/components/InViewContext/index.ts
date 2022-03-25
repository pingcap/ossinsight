import {createContext} from "react";

interface InViewContextProps {
    inView: boolean;
}

export default createContext<InViewContextProps>({
  inView: true,
});
