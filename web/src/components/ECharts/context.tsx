import {createContext, MutableRefObject, Ref} from "react";
import EChartsReact from "echarts-for-react";

export interface EChartsContextProps {
  echartsRef?: MutableRefObject<EChartsReact>
  title?: string
  description?: string
  keyword?: string[]
}

export default createContext<EChartsContextProps>({
  echartsRef: null,
  title: undefined,
  description: undefined,
  keyword: undefined,
})
