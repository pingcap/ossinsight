import { EChartsOption } from 'echarts';
import { TitleOption } from 'echarts/types/dist/shared';
import { dangerousGetCtx } from './_danger';
import { template } from './utils';

export function title(text: string | undefined, options: EChartsOption['title'] = {}): EChartsOption['title'] {
  const { context, isSmall, comparingRepoName } = dangerousGetCtx();
  if (isSmall) {
    return undefined;
  }
  if (!context.layout || !comparingRepoName) {
    return text ? [{
      ...options,
      text,
    }] : [];
  }
  const { layout, layoutTop, layoutSubGridHeight, layoutGap } = context;
  if (layout === 'top-bottom') {
    return template(({ name }, i) => ({
      text: name,
      textStyle: {
        fontWeight: 'normal',
        color: 'gray',
      },
      left: 'center',
      top: layoutTop + (layoutSubGridHeight + layoutGap) * i - 24,
    } as TitleOption)).concat(text ? [{
      ...options,
      text,
    }] : []);
  } else {
    return template(({ name }, i) => ({
      text: name,
      textStyle: {
        fontWeight: 'normal',
        color: 'gray',
      },
      left: `${25 + i * 50}%`,
      top: 8,
    } as TitleOption)).concat(text ? {
      ...options,
      text,
    } : []);
  }
}