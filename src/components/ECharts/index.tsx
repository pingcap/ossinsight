import React, {CSSProperties, useMemo} from "react";
import {EChartsReactProps} from "echarts-for-react/src/types";
import EChartsReact from "echarts-for-react";
import useThemeContext from "@theme/hooks/useThemeContext";
import {AspectRatio} from "react-aspect-ratio";
import 'react-aspect-ratio/aspect-ratio.css'
import BrowserOnly from "@docusaurus/BrowserOnly";
import {registerThemeDark, registerThemeVintage} from "../BasicCharts/theme";
import {Opts} from "echarts-for-react/lib/types";

interface SizeProps {
  aspectRatio?: number
  height?: number | string
  echartsStyle?: CSSProperties
}

interface EChartsProps extends EChartsReactProps, SizeProps {
}

registerThemeVintage()
registerThemeDark()

const ECharts = React.forwardRef<EChartsReact, EChartsProps>(({aspectRatio, height, style, opts, echartsStyle: echartsStyleProp, ...props}, ref) => {
  const echartsStyle = useMemo(() => {
    const result: CSSProperties = Object.assign({}, echartsStyleProp)
    if (aspectRatio) {
      result.height = '100%'
    } else {
      result.height = 400
      Object.assign(result, style)
    }
    if (height) {
      result.height = height
    }
    result.width = '100%'
    result.overflow = 'hidden'
    return result
  }, [style, aspectRatio, height])

  const echartsOpts: Opts = useMemo(() => {
    return Object.assign({
      devicePixelRatio: typeof window === "undefined" ? 1 : window.devicePixelRatio,
      renderer: 'canvas',
      height,
      locale: 'en'
    }, opts)
  }, [opts, height])

  const fallback = useMemo(() => <EChartsPlaceholder aspectRatio={aspectRatio} height={height} />, [aspectRatio, height])

  return (
    <BrowserOnly fallback={fallback}>
      {() => {
        const {isDarkTheme} = useThemeContext();

        const child = (
          <EChartsReact
            {...props}
            opts={echartsOpts}
            style={echartsStyle}
            ref={ref}
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
