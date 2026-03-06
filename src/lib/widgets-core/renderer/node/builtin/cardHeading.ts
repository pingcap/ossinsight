import { Canvas } from '@napi-rs/canvas';
import { getTheme } from '../../../utils/theme';
import { BuiltinProps } from './commons';

export function renderCardHeading (
  canvas: Canvas,
  props: BuiltinProps<'builtin:card-heading'>,
) {
  const {
    subtitle,
    box: { left, height, top, width, dpr },
    title,
  } = props;

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = 'none';
  ctx.textBaseline = 'middle';

  const { CardHeader } = getTheme(props.colorScheme);

  if (subtitle) {
    ctx.textAlign = 'start';
    ctx.font = `bold ${14 * dpr}px`;
    ctx.fillStyle = CardHeader.titleColor;
    ctx.fillText(title, left, top + height / 2, width);

    ctx.textAlign = 'end';
    ctx.font = `normal italic ${12 * dpr}px`;
    ctx.fillStyle = CardHeader.subtitleColor;
    ctx.fillText(subtitle, left + width, top + height / 2, width);
  } else {
    ctx.textAlign = 'center';
    ctx.font = `bold ${14 * dpr}px`;
    ctx.fillStyle = CardHeader.titleColor;
    ctx.fillText(title, left + width / 2, top + height / 2, width);
  }

  ctx.restore();
}
