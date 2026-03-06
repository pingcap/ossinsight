import { Canvas, loadImage } from '@napi-rs/canvas';
import sad from '../../../icons/sad';
import { getTheme } from '../../../utils/theme';
import { BuiltinProps } from './commons';

/**
 *   24px
 * ..8px..
 *   16px
 */
export async function renderEmpty (
  canvas: Canvas,
  props: BuiltinProps<'builtin:empty'>,
) {
  const { width, height, dpr } = props.box;
  const top = (height - 48 * dpr) / 2;

  const { Label } = getTheme(props.colorScheme);

  const ctx = canvas.getContext('2d');

  const sadImage = await loadImage(`data:image/svg+xml;base64,${btoa(sad(24 * dpr, Label.color))}`);

  ctx.drawImage(sadImage, width / 2 - 12 * dpr, top + 24 * dpr, 24 * dpr, 24 * dpr);

  ctx.save();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = `normal ${14 * dpr}px`;
  ctx.fillStyle = Label.color;
  ctx.fillText(props.title ?? 'Oooops! It\'s a Blank Canvas.', (width / 2), top + 64 * dpr, width);
  ctx.restore();
}
