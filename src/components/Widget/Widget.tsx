'use client';

import siteConfig from '@/site.config';
import {
  createDefaultComposeLayout,
  widgetMetadataGenerator,
  widgetVisualizer,
} from '@/utils/widgets';
import { ColorSchemeSelector } from '@/lib/ui';
import { useColorScheme } from '@/lib/ui/components/ColorScheme';
import { LinkedData } from '@/lib/widgets-core/parameters/resolver';
import {
  createVisualizationContext,
  createWidgetContext,
} from '@/lib/widgets-core/utils/context';
import { VisualizerModule } from '@ossinsight/widgets-types';
import { getWidgetSize } from '@/lib/widgets-utils/utils';
import { CSSProperties, use } from 'react';
import clsx from 'clsx';
import WidgetVisualization from '@/lib/widgets-core/renderer/react';
import type { ShareOptions } from '@/lib/ui/components/ShareBlock';
import { XButton } from '@/lib/ui/components/ShareBlock/TwitterButton';

export interface WidgetProps {
  className?: string;
  style?: CSSProperties;
  name: string;
  params: Record<string, string | string[]>;
  data: any;
  linkedData: LinkedData;
  showShadow?: boolean;
  showThemeSwitch?: boolean;
  dense?: boolean;
  shareInfo?: ShareOptions;
}

export default function Widget({
  className,
  style,
  name,
  params,
  data,
  linkedData,
  showShadow = true,
  showThemeSwitch = true,
  dense = false,
  shareInfo,
}: WidgetProps) {
  let visualizer = use(widgetVisualizer(name));
  const generateMetadata = use(widgetMetadataGenerator(name));
  const dynamicHeight = visualizer?.computeDynamicHeight?.(data);
  const { colorScheme, setColorScheme } = useColorScheme();

  const { width, height } = resolveWidgetSize(visualizer, dynamicHeight);

  if (visualizer.type !== 'compose') {
    visualizer = createDefaultComposeLayout(name, data, {
      generateMetadata,
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

  return (
    <>
      <div className='p-4 flex gap-4'>
        {showThemeSwitch && (
          <div>
            <ColorSchemeSelector
              value={colorScheme}
              onValueChange={setColorScheme}
            />
          </div>
        )}
        <Divider mode='vertical' />
        {shareInfo && (
          <XButton
            text={shareInfo.title}
            tags={shareInfo.keywords}
            url={shareInfo.url}
            size={12}
            label='Twitter'
          />
        )}
      </div>
      <div
        className={clsx('relative w-full h-[calc(100%-62px)]', {
          ['flex items-center justify-center']: !dynamicHeight,
          'bg-white': colorScheme === 'light',
          'bg-body': colorScheme !== 'light',
          'p-4': !dense,
        })}
      >
        <div
          className={clsx('rounded-xl max-w-full overflow-hidden', {
            ['shadow-2xl']: showShadow,
          })}
          style={{
            width,
            aspectRatio: `${width} / ${height}`,
            margin: !!dynamicHeight ? '0 auto' : undefined,
          }}
        >
          <WidgetVisualization
            className={
              dynamicHeight ? `Widget-dynamicHeight ${className}` : className
            }
            dynamicHeight={dynamicHeight}
            style={{
              ...style,
              aspectRatio: `${width} / ${height}`,
            }}
            type={visualizer.type}
            visualizer={visualizer}
            data={data}
            parameters={params}
            linkedData={linkedData}
            colorScheme={colorScheme}
          />
        </div>
        {/* {showThemeSwitch && (
          <div className='absolute right-4 top-4 lg:right-40 lg:top-8'>
            <ColorSchemeSelector
              value={colorScheme}
              onValueChange={setColorScheme}
            />
          </div>
        )} */}
      </div>
    </>
  );
}

function Divider(props: { mode?: 'horizontal' | 'vertical' }) {
  const { mode = 'horizontal' } = props;
  return (
    <div
      className={clsx(
        'border-neutral-100',
        mode === 'horizontal' ? 'border-t' : 'border-l',
        'opacity-50'
      )}
    />
  );
}

function resolveWidgetSize (visualizer: VisualizerModule<any, any, any, any>, dynamicHeight: number | undefined) {
  if (dynamicHeight) {
    return {
      width: visualizer.width ?? siteConfig.sizes.default.width,
      height: dynamicHeight,
    }
  } else if (visualizer.grid) {
    const gridSizes = getWidgetSize();

    const cols = maxOf(visualizer.grid.cols);
    const rows = maxOf(visualizer.grid.rows);

    return {
      width: gridSizes.widgetWidth(cols),
      height: gridSizes.widgetWidth(rows),
    }
  } else {
    return {
      width: visualizer.width || siteConfig.sizes.default.width,
      height: visualizer.height || siteConfig.sizes.default.height,
    }
  }
}

function maxOf (value: number | { min: number, max: number }) {
  if (typeof value === 'number') {
    return value;
  }
  return value.max;
}
