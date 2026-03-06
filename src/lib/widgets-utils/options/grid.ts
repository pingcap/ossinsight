import { GridOption } from 'echarts/types/dist/shared';
import { OptionId } from 'echarts/types/src/util/types';
import type {
  EChartsVisualizationConfig,
  WidgetVisualizerContext,
} from '@ossinsight/widgets-types';

export function grid(id: OptionId, option: GridOption = {}): GridOption {
  return {
    left: 8,
    right: 16,
    containLabel: true,
    ...option,
    id,
  };
}

export function topBottomLayoutGrid(vs?: boolean, options?: GridOption) {
  if (!vs) return { ...grid('main'), ...options };
  return [
    {
      ...grid('main'),
      ...options,
      bottom: '55%',
    },
    {
      ...grid('vs'),
      ...options,
      top: '55%',
    },
  ];
}

export function simpleGrid(padding: number, containLabel = false): GridOption {
  return {
    left: padding,
    top: padding,
    right: padding,
    bottom: padding,
    containLabel: containLabel,
  };
}

export function parseParams2GridOpt<
  T extends { repo_id: string; vs_repo_id?: string }
>(ctx: WidgetVisualizerContext<T>) {
  const runtime = ctx.runtime;
  const isServer = runtime === 'server';
  const dpr = ctx.dpr;
  const defaultPadding = 0;

  const serverGrid = simpleGrid(defaultPadding, true);

  const grids = topBottomLayoutGrid(
    !!ctx.parameters.vs_repo_id,
    isServer ? serverGrid : {}
  );

  return grids;
}
