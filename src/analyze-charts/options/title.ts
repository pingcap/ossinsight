import { EChartsOption } from 'echarts';
import { TitleOption } from 'echarts/types/dist/shared';
import { dangerousGetCtx } from './_danger';
import { simple, template } from './utils';

export function title(text: string | undefined, options: EChartsOption['title'] = {}): EChartsOption['title'] {
  const { context } = dangerousGetCtx();
  if (!context.layout) {
    return text ? [{
      ...options,
      text,
    }] : []
  }
  return simple(
    text ? [{
      ...options,
      text,
    }] : [],
    template(({ name }, i) => ({
      text: name,
      textStyle: {
        fontWeight: 'normal',
        color: 'gray',
      },
      left: context.layout === 'top-bottom' ? 'center' : `${25 + i * 50}%`,
      top: context.layout === 'top-bottom' ? (i === 0 ? '5.5%' : undefined) : '2%',
      bottom: context.layout === 'top-bottom' ? (i === 1 ? '50.5%' : undefined) : undefined
    } as TitleOption)).concat(text ? {
      ...options,
      text,
    } : []));
}