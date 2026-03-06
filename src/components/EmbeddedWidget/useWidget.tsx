import { createDefaultComposeLayout, widgetMetadataGenerator, widgetVisualizer } from '@/utils/widgets';
import { ColorSchemeContext } from '@/lib/ui/components/ColorScheme/context';
import { LinkedData } from '@/lib/widgets-core/parameters/resolver';
import WidgetVisualization from '@/lib/widgets-core/renderer/react';
import { createVisualizationContext, createWidgetContext } from '@/lib/widgets-core/utils/context';
import { CSSProperties, forwardRef, lazy, LazyExoticComponent, ReactElement, RefAttributes, useContext, useMemo } from 'react';

interface WidgetProps {
  className?: string;
  style?: CSSProperties;
  name: string;
  params: Record<string, string | string[]>;
  data: any;
  linkedData: LinkedData;
}

type WidgetComponent = {
  (props: WidgetProps & RefAttributes<HTMLDivElement>): ReactElement | null;
  displayName?: string;
};

// FIXME
const dirtyWidgetsMap = new Map<string, LazyExoticComponent<WidgetComponent>>();

export function useWidget (name: string) {
  const cached = dirtyWidgetsMap.get(name);
  if (cached) {
    return cached;
  } else {
    const Widget = lazy(() => createWidget(name).then(Widget => ({ default: Widget })));
    dirtyWidgetsMap.set(name, Widget);
    return Widget;
  }
}

async function createWidget (name: string): Promise<WidgetComponent> {
  const [
    visualizer,
    metadataGenerator,
  ] = await Promise.all([
    widgetVisualizer(name),
    widgetMetadataGenerator(name),
  ]);

  const Widget: WidgetComponent = forwardRef<HTMLDivElement, WidgetProps>(({
    className, style, name, data, linkedData, params,
  }, forwardedRef) => {
    const { colorScheme } = useContext(ColorSchemeContext);

    const dynamicHeight = useMemo(() => {
      return visualizer.computeDynamicHeight?.(data);
    }, [data]);

    const width = visualizer.width ?? 0;
    const height =
      dynamicHeight ?? visualizer.height ?? 0;

    const finalVisualizer = (() => {
      if (visualizer.type !== 'compose') {
        return createDefaultComposeLayout(name, data, {
          generateMetadata: metadataGenerator,
          ctx: {
            ...createVisualizationContext({
              width,
              height,
              dpr: devicePixelRatio,
              colorScheme,
            }),
            ...createWidgetContext('client', params, linkedData),
          },
        });
      }
      return visualizer;
    })();

    return (
      <WidgetVisualization
        noSuspense
        className={className}
        style={style}
        type={finalVisualizer.type}
        visualizer={finalVisualizer}
        data={data}
        parameters={params}
        linkedData={linkedData}
        colorScheme={colorScheme}
        ref={forwardedRef}
      />
    );
  });

  Widget.displayName = `Widget:${name}`;

  return Widget;
}
