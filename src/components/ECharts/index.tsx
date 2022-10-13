import React, {
  CSSProperties,
  ForwardedRef,
  Ref,
  RefCallback,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo, useRef, useState,
} from 'react';
import {EChartsReactProps} from "echarts-for-react/src/types";
import EChartsReact, { EChartsInstance } from "echarts-for-react";
import useThemeContext from "@theme/hooks/useThemeContext";
import {AspectRatio} from "react-aspect-ratio";
import 'react-aspect-ratio/aspect-ratio.css'
import BrowserOnly from "@docusaurus/BrowserOnly";
import {registerThemeDark, registerThemeVintage} from "../BasicCharts/theme";
import {Opts} from "echarts-for-react/lib/types";
import EChartsContext from './context'
import InViewContext from '../InViewContext';

interface SizeProps {
  aspectRatio?: number
  height?: number | string
  echartsStyle?: CSSProperties
}

export interface EChartsProps extends EChartsReactProps, SizeProps {
  observe?: (element?: HTMLElement | null) => void;
}

registerThemeVintage()
registerThemeDark()

const ECharts = React.forwardRef<EChartsReact, EChartsProps>(({aspectRatio, height, style, opts, echartsStyle: echartsStyleProp, observe, ...props}, ref: ForwardedRef<EChartsReact>) => {
  const realHeight = useMemo(() => {
    if (aspectRatio) {
      return '100%'
    } else {
      return height || 400
    }
  }, [aspectRatio, height])

  const {inView} = useContext(InViewContext)

  const echartsStyle = useMemo(() => {
    const result: CSSProperties = Object.assign({}, echartsStyleProp)
    result.height = realHeight
    result.width = '100%'
    result.overflow = 'hidden'
    return result
  }, [style, aspectRatio, realHeight, inView])

  const echartsOpts: Opts = useMemo(() => {
    return Object.assign({
      devicePixelRatio: typeof window === "undefined" ? 1 : window.devicePixelRatio,
      renderer: 'canvas',
      height: 'auto',
      locale: 'en',
    }, opts)
  }, [opts, realHeight])

  const { echartsRef } = useContext(EChartsContext)
  const [eRef, setERef] = useState<EChartsInstance>();

  const combinedRef: RefCallback<EChartsReact> = useCallback((instance) => {
    if (echartsRef) {
      echartsRef.current = instance
    }
    setERef(instance);
    if (ref) {
      if (typeof ref === 'function') {
        ref(instance)
      } else {
        ref.current = instance
      }
    }
    observe?.(instance?.ele ?? null)
  }, [ref, echartsRef, observe])

  const fallback = useMemo(() => <EChartsPlaceholder aspectRatio={aspectRatio} height={realHeight} />, [aspectRatio, realHeight])

  useLayoutEffect(() => {
    eRef?.resize();
  }, [eRef])

  return (
    <BrowserOnly fallback={fallback}>
      {() => {
        const {isDarkTheme} = useThemeContext();

        const child = (
          <EChartsReact
            {...props}
            opts={echartsOpts}
            style={echartsStyle}
            ref={combinedRef}
            theme={isDarkTheme ? 'dark' : 'vintage'}
          />
        )

        if (aspectRatio) {
          return (
            <AspectRatio ratio={aspectRatio} style={style}>
              {child}
            </AspectRatio>
          )
        } else {
          return child
        }
      }}
    </BrowserOnly>
  )
})

const EChartsPlaceholder = ({ height, aspectRatio }: SizeProps) => {
  if (aspectRatio) {
    return (
      <AspectRatio ratio={aspectRatio} >
        <div/>
      </AspectRatio>
    )
  } else {
    return <div style={{ height: height || 400, width: '100%' }} />
  }
}

export default ECharts
export { default as EChartsContext } from './context';
export type { EChartsContextProps } from './context';
