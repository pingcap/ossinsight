import {createContext, MutableRefObject, Ref} from "react";
import EChartsReactCore from "echarts-for-react/src/core";

export interface EChartsContextProps {
  echartsRef?: MutableRefObject<EChartsReactCore>
}

export default createContext<EChartsContextProps>({
  echartsRef: null
})
