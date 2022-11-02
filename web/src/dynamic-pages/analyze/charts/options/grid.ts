import { GridOption } from 'echarts/types/dist/shared';
import { OptionId } from 'echarts/types/src/util/types';
import { dangerousGetCtx } from './_danger';
import { isSmall } from './sizes';

export function grid (id: OptionId, option: GridOption = {}): GridOption {
  const small = isSmall();
  return {
    top: small ? 32 : 64,
    bottom: small ? 8 : 48,
    left: small ? 0 : 8,
    right: small ? 0 : 8,
    ...option,
    id,
  };
}

export function topBottomLayoutGrid () {
  const { context, height, isSmall, comparingRepoName } = dangerousGetCtx();
  if (!comparingRepoName) {
    return grid('main');
  } else {
    const gap = 32;
    const top = isSmall ? 32 : 64;
    const bottom = isSmall ? 8 : 48;

    const subGridHeight = (height - top - bottom - gap) / 2;
    const topBottom = bottom + subGridHeight + gap;
    const bottomTop = top + subGridHeight + gap;

    context.layout = 'top-bottom';
    context.layoutTop = top;
    context.layoutSubGridHeight = subGridHeight;
    context.layoutGap = gap;
    return [
      grid('main', { top, bottom: topBottom }),
      grid('vs', { top: bottomTop, bottom }),
    ];
  }
}

export function leftRightLayoutGrid () {
  const { context, comparingRepoName } = dangerousGetCtx();
  if (!comparingRepoName) {
    return grid('main');
  } else {
    context.layout = 'left-right';
    return [
      grid('main', { left: '8', right: '52%', top: '64', bottom: '48' }),
      grid('vs', { left: '52%', right: '8', top: '64', bottom: '48' }),
    ];
  }
}
