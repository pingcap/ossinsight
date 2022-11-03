import type { EChartsOption } from 'echarts';
import { TitleOption } from 'echarts/types/dist/shared';
import { dangerousGetCtx } from './_danger';
import { template } from './utils';
import { notFalsy } from '@site/src/utils/value';

export function title (text: string | undefined, options: EChartsOption['title'] = {}): EChartsOption['title'] {
  const { context, isSmall, comparingRepoName } = dangerousGetCtx();
  if (isSmall) {
    return undefined;
  }
  if (notFalsy(context.layout) || !comparingRepoName) {
    return text
      ? [{
          ...options,
          text,
        }]
      : [];
  }
  const { layout, layoutTop, layoutSubGridHeight, layoutGap } = context;
  if (layout === 'top-bottom') {
    return template(({ name }, i): TitleOption => ({
      text: name,
      textStyle: {
        fontWeight: 'normal',
        color: 'gray',
      },
      left: 'center',
      top: (layoutTop as number) + ((layoutSubGridHeight as number) + (layoutGap as number)) * i - 24,
    })).concat(text
      ? [{
          ...options,
          text,
        }]
      : []);
  } else {
    return template(({ name }, i): TitleOption => ({
      text: name,
      textStyle: {
        fontWeight: 'normal',
        color: 'gray',
      },
      left: `${25 + i * 50}%`,
      top: 8,
    })).concat(text
      ? {
          ...options,
          text,
        }
      : []);
  }
}
