import { createCanvas } from '@napi-rs/canvas';
import { visualizers } from '@ossinsight/widgets';
import { WidgetComposeItem } from '@ossinsight/widgets-types';
import { WidgetNodeVisualizationProps } from '../../types';
import { createVisualizationContext, createWidgetContext } from '../../utils/context';
import { getTheme } from '../../utils/theme';
import { renderBuiltin } from './builtin';
import { transformBox } from './builtin/commons';
import render from './index';

const WRAP_BORDER_RADIUS = 12;
const WRAP_PADDING = 0.5;

export default async function renderCompose (props: WidgetNodeVisualizationProps) {
  const { data, visualizer, dpr, parameters, linkedData, colorScheme, root, sizeName } = props;
  let { width, height } = props;

  // should wrap with shadow box if the widget is 'compose' type or the rendering context is not twitter.
  const shouldWrap = !!(root || sizeName !== 'twitter:summary_large_image');

  width = (visualizer.width || width);
  height = (visualizer.height || height);

  const offX = shouldWrap ? WRAP_PADDING : 0;
  const offY = shouldWrap ? WRAP_PADDING : 0;

  const canvasPadding = (shouldWrap ? WRAP_PADDING : 0) * dpr;
  const canvasBorderRadius = WRAP_BORDER_RADIUS * dpr;
  const canvasWidth = width * dpr + canvasPadding * 2;
  const canvasHeight = height * dpr + canvasPadding * 2;
  const canvasOffX = offY * dpr;
  const canvasOffY = offX * dpr;

  let canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  const theme = getTheme(colorScheme);

  if (shouldWrap) {
    const containerWidth = width * dpr;
    const containerHeight = height * dpr;

    ctx.fillStyle = theme.Container.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = theme.Container.Card.borderColor;

    ctx.fillStyle = theme.Container.Card.backgroundColor;
    ctx.moveTo(canvasOffX, canvasOffY);
    ctx.roundRect(canvasOffX, canvasOffY, containerWidth, containerHeight, canvasBorderRadius);
    ctx.fill();
    ctx.lineWidth = dpr;
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.fillStyle = theme.Orphan.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  const option: WidgetComposeItem[] = visualizer.default(data, {
    ...createVisualizationContext({ width, height, dpr, colorScheme }),
    ...createWidgetContext('server', parameters, linkedData),
  });

  const all = option.map(async (item) => {
    const left = offX + item.left;
    const top = offY + item.top;
    const width = item.width;
    const height = item.height;
    const box = { left, top, width, height, dpr };
    if (item.widget.startsWith('builtin:')) {
      await renderBuiltin(canvas, item.widget, {
        colorScheme,
        box,
        ...item.parameters,
      });
    } else {
      const visualizer = await visualizers[item.widget]();
      const subCanvas = await render({
        width,
        height,
        dpr,
        visualizer,
        data: item.data,
        parameters: item.parameters,
        linkedData,
        type: visualizer.type,
        colorScheme,
        root: false,
      });
      const box = transformBox({ ...item, dpr });
      ctx.drawImage(subCanvas, canvasOffX + box.left, canvasOffY + box.top, box.width, box.height);
    }
  });

  await Promise.all(all);

  if (sizeName === 'twitter:summary_large_image' && root) {
    const twitterCanvas = createCanvas(800, 418);
    let idealWidth = canvas.width;
    let idealHeight = canvas.height;

    if (idealWidth > 800) {
      idealHeight *= 800 / idealWidth;
      idealWidth = 800;
    }

    if (idealHeight > 418) {
      idealWidth *= 418 / idealHeight;
      idealHeight = 418;
    }

    const tCtx = twitterCanvas.getContext('2d');
    tCtx.fillStyle = 'rgb(31, 30, 40)';
    tCtx.beginPath();
    tCtx.rect(0, 0, 800, 418);
    tCtx.fill();
    tCtx.restore();

    const y = (418 - idealHeight) / 2;
    const x = (800 - idealWidth) / 2;

    tCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, x, y, idealWidth, idealHeight);
    return twitterCanvas;
  } else {
    return canvas;
  }
}