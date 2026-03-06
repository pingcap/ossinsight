import { Canvas, loadImage, Path2D } from '@napi-rs/canvas';
import { getTheme } from '../../../utils/theme';
import { BuiltinProps } from './commons';

export async function renderAvatarProgress(
  canvas: Canvas,
  props: BuiltinProps<'builtin:avatar-progress'>
) {
  const {
    box: { dpr, left, top, width },
    label = '',
    imgSrc = '',
    value = 0,
    maxVal = 100,
    size = 20,
    backgroundColor = '#888',
    color = '#ffe895',
    labelColor = [],
    valueFormatter = (v) => `${v}`,
  } = props;

  const { Label, Value, Avatar } = getTheme(props.colorScheme);

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = 'none';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'start';

  ctx.font = `normal ${12 * dpr}px`;
  ctx.fillStyle = labelColor?.[0] || Label.color;
  label && ctx.fillText(label, left + 30 * dpr, top + 7 * dpr, width);
  ctx.textAlign = 'right';
  ctx.fillStyle = labelColor?.[1] || Label.color;
  value && ctx.fillText(valueFormatter(value), left + width, top + 7 * dpr, width);

  ctx.textAlign = 'start';

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(left + 30 * dpr, top + 20 * dpr, Math.abs(width - left), 4 * dpr);

  ctx.fillStyle = color;
  const percent = value / maxVal;
  ctx.fillRect(
    left + 30 * dpr,
    top + 20 * dpr,
    Math.abs(width - left) * percent,
    4 * dpr
  );

  if (imgSrc) {
    try {
      const buffer = await fetch(imgSrc, { cache: 'force-cache' }).then((res) =>
        res.arrayBuffer()
      );
      const avatar = await loadImage(buffer, {
        alt: 'label',
      });
      let circlePath = new Path2D();
      circlePath.arc(
        left + (size / 2) * dpr,
        top + (size / 2 + 2) * dpr,
        (size / 2) * dpr,
        0,
        2 * Math.PI
      );
      ctx.clip(circlePath);
      ctx.drawImage(avatar, left, top + 2 * dpr, size * dpr, size * dpr);
    } catch {
      ctx.fillStyle = Avatar.fallbackColor;
      ctx.lineWidth = dpr;
      ctx.beginPath();
      ctx.arc(
        left + (size / 2) * dpr,
        top + (size / 2 + 2) * dpr,
        (size / 2) * dpr,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }

  ctx.restore();
}
