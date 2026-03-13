/* eslint-disable */
import * as d3 from 'd3-hierarchy';
import type { CustomSeriesOption } from 'echarts';
import {
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
  CustomSeriesRenderItemReturn,
} from 'echarts/types/dist/echarts';

export interface D3HierarchyItem {
  id: string;
  name: string;
  value: number;
  depth: number;
  index: number;
  parentId: string;
  color?: string;
}

export function d3Hierarchy (seriesData: D3HierarchyItem[], maxDepth: number): CustomSeriesOption {
  const displayRoot = stratify();

  function stratify () {
    return d3
      .stratify<D3HierarchyItem>()
      .parentId(function (d) {
        return d.parentId;
      })(seriesData)
      .sum(function (d) {
        return d.value || 0;
      })
      .sort(function (a, b) {
        return (b.value ?? 0) - (a.value ?? 0);
      });
  }

  function overallLayout (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI) {
    const context: any = params.context;

    context.nodes = {};
    d3
      .pack()
      .size([api.getWidth() - 32, api.getHeight() - 32])
      .padding(8)(displayRoot);
    displayRoot.descendants().forEach(function (node, index) {
      context.nodes[node.id ?? ''] = node;
    });
  }

  function renderItem (params: CustomSeriesRenderItemParams, api: CustomSeriesRenderItemAPI): CustomSeriesRenderItemReturn {
    const context: any = params.context;
    // Only do that layout once in each time `setOption` called.
    if (!context.layout) {
      context.layout = true;
      overallLayout(params, api);
    }
    const nodePath = api.value('id') as string;
    const node = context.nodes[nodePath];
    if (!node) {
      // Reder nothing.
      return;
    }
    const isLeaf = !node.children || !node.children.length;
    const focus = new Uint32Array(
      node.descendants().map(function (node) {
        return node.data.index;
      }),
    );
    const nodeName = isLeaf
      ? nodePath.split(/^\d-/)[1]
      : '';
    const z2 = (api.value('depth') as number) * 2;
    if (node.id === 'root') {
      return undefined;
    }
    return {
      type: 'circle',
      focus,
      shape: {
        cx: node.x,
        cy: node.y + 16,
        r: node.r,
      },
      transition: ['shape'],
      z2,
      textContent: {
        type: 'text',
        style: {
          // transition: isLeaf ? 'fontSize' : null,
          text: nodeName,
          fontFamily: 'Arial',
          width: node.r * 1.3,
          overflow: 'truncate',
          fontSize: node.r / 3,
        },
        emphasis: {
          style: {
            overflow: null,
            fontSize: Math.max(node.r / 3, 12),
          },
        },
      },
      textConfig: {
        position: 'inside',
      },
      style: {
        fill: node.data.color ?? api.visual('color'),
      },
      emphasis: {
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          shadowBlur: 20,
          shadowOffsetX: 3,
          shadowOffsetY: 5,
          shadowColor: 'rgba(0,0,0,0.3)',
        },
      },
    } as any;
  }

  return {
    type: 'custom',
    renderItem,
    progressive: 0,
    coordinateSystem: 'none',
    encode: {
      tooltip: 'value',
      itemName: 'name',
      value: 'value',
    },
  };
}
