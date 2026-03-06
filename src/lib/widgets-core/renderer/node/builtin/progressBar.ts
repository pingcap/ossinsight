import { Canvas } from '@napi-rs/canvas';
import { getTheme } from '../../../utils/theme';
import { BuiltinProps } from './commons';

export function renderProgressBar(
  canvas: Canvas,
  props: BuiltinProps<'builtin:progress-bar'>
) {
  const {
    box: { dpr, left, top, width },
    items = [],
  } = props;

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = 'none';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'start';

  let lastWidth = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const { color, percentage } = item;
    ctx.fillStyle = color || '#888';
    const currentWidth = Math.abs(width) * percentage;
    ctx.fillRect(left + lastWidth, top + 20 * dpr, currentWidth, 6 * dpr);
    lastWidth += currentWidth;
  }

  ctx.restore();
}
