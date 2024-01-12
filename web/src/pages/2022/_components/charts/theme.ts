/* eslint-disable @typescript-eslint/no-namespace */
import { responsive } from './responsive';
import ChartJs, { Color, FontSpec, GridLineOptions, TitleOptions } from 'chart.js/auto';
import { notNullish } from '@site/src/utils/value';

namespace theme {
  export namespace font {
    export const title = responsive<FontSpec>({
      size: [14, 16, 20],
      weight: ['bold'],
    });

    export const subtitle = responsive<FontSpec>({
      size: [10, 13],
      style: [undefined, 'italic'],
      weight: [undefined, 'bold'],
    });

    export const ticks = responsive<FontSpec>({
      size: [10, 12, 14],
    });

    export const legend = responsive<FontSpec>({
      size: [10, 13, 15],
    });

    export const tooltipTitle = responsive<FontSpec>({
      size: [14, 16, 18],
      weight: ['bold'],
    });

    export const tooltipBody = responsive<FontSpec>({
      size: [16, 18, 20],
    });
  }

  export namespace color {
    export const title = '#FFFFFF';
    export const tooltipTitle = '#BFBFBF';
    export const subtitle = '#7C7C7C';
    export const gridLine = '#BFBFBF80';
    export const ticks = '#E0E0E0';
    export const legend = '#BFBFBF';
  }

  export namespace grid {
    export const normal: Partial<GridLineOptions> = {
      color: color.gridLine,
      borderColor: 'transparent',
      borderDash: [4, 4],
    };

    export const hidden: Partial<GridLineOptions> = {
      display: false,
      borderColor: 'transparent',
    };
  }

  export const title = (text: string | undefined, _color?: Color | undefined): Partial<TitleOptions> => ({
    display: !!text,
    position: 'top',
    text,
    color: color.title ?? _color,
    font: font.title,
  });

  export const subtitle = (text: string | undefined): Partial<TitleOptions> => ({
    position: 'bottom',
    align: 'end',
    text,
    display: notNullish(text),
    color: color.subtitle,
    padding: 12,
    font: font.subtitle,
  });
}

ChartJs.defaults.font = {
  family: 'JetBrains Mono',
  size: 20,
};

export default theme;
