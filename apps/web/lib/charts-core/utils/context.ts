import { LinkedDataContext, VisualizationContext, WidgetBaseContext } from '@/lib/charts-types';
import { generateZoneOptions, PERIOD_OPTIONS } from '@/utils/options/time';
import * as colors from 'tailwindcss/colors';
import { LinkedData } from '../parameters/resolver';
import { echartsColorPalette } from '../renderer/echarts-theme';

export function createWidgetBaseContext<P extends Record<string, string | string[]>> (runtime: 'client' | 'server', parameters: P, createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas')): WidgetBaseContext {
  return {
    runtime,
    parameters,
    createCanvas,
    getTimeParams (): any {
      const { DEFAULT_ZONE } = generateZoneOptions();

      return {
        zone: parameters?.zone || DEFAULT_ZONE,
        period: parameters?.period || PERIOD_OPTIONS[0],
      };
    },
  };
}

export function createLinkedDataContext (linkedData: LinkedData): LinkedDataContext {
  return {
    getRepo (id: number): any {
      return linkedData.repos[String(id)];
    },
    getUser (id: number): any {
      return linkedData.users[String(id)];
    },
    getCollection (id: number): any {
      return linkedData.collections[String(id)];
    },
    getOrg (id: number): any {
      return linkedData.orgs[String(id)];
    },
  };
}

export function createWidgetContext<P extends Record<string, string | string[]>> (runtime: 'client' | 'server', parameters: P, linkedData: LinkedData) {
  return {
    ...createWidgetBaseContext(runtime, parameters),
    ...createLinkedDataContext(linkedData),
  };
}

export function createVisualizationContext ({ width, height, dpr, colorScheme = 'dark' }: Pick<VisualizationContext, 'width' | 'height' | 'dpr'> & { colorScheme?: string }): VisualizationContext {
  return {
    width,
    height,
    dpr,
    theme: { colors, colorScheme: colorScheme, echartsColorPalette },
  };
}
