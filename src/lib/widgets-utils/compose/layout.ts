import type { WidgetComposeItem } from '@ossinsight/widgets-types';
import { isEmptyData } from '../utils';
import type { WidgetsDefinitions } from '@ossinsight/internal/widgets';


export type Spacing =
  [top: number, right: number, bottom: number, left: number]
  | [top: number, horizontal: number, bottom: number]
  | [vertical: number, horizontal: number]
  | number;

export type ResolvedSpacing = {
  top: number
  left: number
  right: number
  bottom: number
}

export interface BaseLayout {
  layout: string;
  padding?: Spacing;
  gap?: number;

  // fixed size on axis, default is flexible (undefined)
  // after compute: computed size, used by parent flex layout.
  size?: number;

  // like flex-grow, if size not set. default to `1`, used by parent flex layout.
  grow?: number;

  // TODO: impl if needed
  // // used by parent grid layout, default to 1
  // colSpan?: number;
  // rowSpan?: number;
  //
  // // used by parent grid layout, need to be provided before compute
  // col?: number;
  // row?: number;

  children: Layout[];
}

export interface FlexBaseLayout extends BaseLayout {
  layout: 'flex';
  direction: 'vertical' | 'horizontal';
}

export interface VerticalLayout extends FlexBaseLayout {
  direction: 'vertical';
}

export interface HorizontalLayout extends FlexBaseLayout {
  direction: 'horizontal';
}

export interface GridLayout extends BaseLayout {
  layout: 'grid';
  cols: number;
  rows: number;
  children: Layout[];
}

export interface WidgetLayout extends BaseLayout {
  layout: 'widget';
  widget: string;
  parameters: Record<string, any>;
  data: any;
}

export type Layout = VerticalLayout | HorizontalLayout | GridLayout | WidgetLayout;

/**
 * @deprecated Use @/lib/compose
 */
export class LayoutBuilder<L extends BaseLayout> {
  layout: L;

  constructor (layout: L) {
    this.layout = layout;
  }

  gap (size: number) {
    this.layout.gap = size;
    return this;
  }

  padding (padding: Spacing) {
    this.layout.padding = padding;
    return this;
  }

  fix (size: number) {
    this.layout.size = size;
    this.layout.grow = undefined;
    return this;
  }

  flex (grow: number = 1) {
    this.layout.size = undefined;
    this.layout.grow = grow;
    return this;
  }

}

/**
 * @deprecated Use @/lib/compose
 */
export function vertical (...children: Array<Layout | LayoutBuilder<any>>): LayoutBuilder<VerticalLayout> {
  return new LayoutBuilder({
    layout: 'flex',
    direction: 'vertical',
    padding: 0,
    gap: 0,
    size: undefined,
    grow: undefined,
    children: children.map(l => l instanceof LayoutBuilder ? l.layout : l),
  });
}

/**
 * @deprecated Use @/lib/compose
 */
export function horizontal (...children: Array<Layout | LayoutBuilder<any>>): LayoutBuilder<HorizontalLayout> {
  return new LayoutBuilder({
    layout: 'flex',
    direction: 'horizontal',
    padding: 0,
    gap: 0,
    size: undefined,
    grow: undefined,
    children: children.map(l => l instanceof LayoutBuilder ? l.layout : l),
  });
}

/**
 * @deprecated Use @/lib/compose
 */
export function grid (rows: number, cols: number, ...children: Array<Layout | LayoutBuilder<any>>): LayoutBuilder<GridLayout> {
  return new LayoutBuilder({
    layout: 'grid',
    padding: 0,
    gap: 0,
    size: undefined,
    grow: undefined,
    rows,
    cols,
    children: children.map(l => l instanceof LayoutBuilder ? l.layout : l),
  });
}

/**
 * @deprecated Use @/lib/compose
 */
export function widget (name: string, data: any, parameters: Record<string, any>) {
  return new LayoutBuilder({
    layout: 'widget',
    widget: name,
    data,
    parameters,
    padding: 0,
    gap: 0,
    size: undefined,
    grow: undefined,
    children: [],
  });
}

/**
 * @deprecated Use @/lib/compose
 */
export function nonEmptyDataWidget (data: any, builder: () => LayoutBuilder<any> | Layout) {
  if (isEmptyData(data)) {
    return widget('builtin:empty', undefined, {});
  } else {
    return builder();
  }
}

export function computeLayout (input: Layout | LayoutBuilder<any>, left: number, top: number, width: number, height: number): WidgetComposeItem[] {
  const layout: Layout = input instanceof LayoutBuilder ? input.layout : input;
  const padding = resolveSpacing(layout.padding);
  const gap = layout.gap ?? 0;
  switch (layout.layout) {
    case 'widget':
      return [{
        widget: layout.widget,
        left: left + padding.left,
        top: top + padding.top,
        width: width - padding.left - padding.right,
        height: height - padding.top - padding.bottom,
        parameters: layout.parameters,
        data: layout.data,
      }];
    case 'flex': {
      let restSize: number;

      if (layout.direction === 'vertical') {
        restSize = height - padding.top - padding.bottom - gap * (layout.children.length - 1);
      } else {
        restSize = width - padding.left - padding.right - gap * (layout.children.length - 1);
      }

      let flexibleChildren: Array<{ index: number, grow: number }> = [];
      for (let i = 0; i < layout.children.length; i++) {
        let child = layout.children[i];
        if ('size' in child && child.size && child.size > 0) {
          restSize -= child.size;
        } else {
          flexibleChildren.push({ index: i, grow: 'grow' in child && child.grow && child.grow > 0 ? child.grow : 1 });
        }
      }
      if (restSize > 0 && flexibleChildren.length > 0) {
        const sumGrow = flexibleChildren.reduce((sum, item) => sum + (item.grow ?? 1), 0);
        for (let flexibleChild of flexibleChildren) {
          layout.children[flexibleChild.index].size = flexibleChild.grow / sumGrow * restSize;
        }
      } else if (restSize <= 0 && flexibleChildren.length > 0) {
        // FIXME: org page will always trigger this warn for initial render.
        // console.warn('children have no enough space.');
        for (let flexibleChild of flexibleChildren) {
          layout.children[flexibleChild.index].size = 0;
        }
      }

      if (layout.direction === 'vertical') {
        let sum = 0;
        return layout.children.flatMap((child, i) => {
          const size = child.size ?? 0;
          const result = computeLayout(child, left + padding.left, top + padding.top + gap * i + sum, width - padding.left - padding.right, size);
          sum += size;
          return result;
        });
      } else {
        let sum = 0;
        return layout.children.flatMap((child, i) => {
          const size = child.size ?? 0;
          const result = computeLayout(child, left + gap * i + sum + padding.left, top + padding.top, size, height - padding.top - padding.bottom);
          sum += size;
          return result;
        });
      }
    }
    case 'grid': {
      const { rows, cols } = layout;
      const cellWidth = (width - padding.left - padding.right - gap * (cols - 1)) / cols;
      const cellHeight = (height - padding.top - padding.bottom - gap * (rows - 1)) / rows;

      let k = 0;
      const items: WidgetComposeItem[] = [];
      rootFor: for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (k >= layout.children.length) {
            break rootFor;
          }
          const cellTop = top + padding.top + (gap + cellHeight) * i;
          const cellLeft = left + padding.left + (gap + cellWidth) * j;

          items.push(...computeLayout(layout.children[k], cellLeft, cellTop, cellWidth, cellHeight));
          k++;
        }
      }
      return items;
    }
    default:
      console.warn(`unknown layout type`, layout);
      return [];
  }
}

function resolveSpacing (spacing: Spacing | undefined): ResolvedSpacing {
  if (!spacing) {
    return { top: 0, left: 0, bottom: 0, right: 0 };
  }
  if (typeof spacing === 'number') {
    return { top: spacing, left: spacing, bottom: spacing, right: spacing };
  } else {
    switch (spacing.length) {
      case 2:
        return { top: spacing[0], bottom: spacing[0], left: spacing[1], right: spacing[1] };
      case 3:
        return { top: spacing[0], left: spacing[1], right: spacing[1], bottom: spacing[2] };
      case 4:
        return { top: spacing[0], right: spacing[1], bottom: spacing[2], left: spacing[3] };
      default:
        throw new Error('bad spacing value');
    }
  }
}
