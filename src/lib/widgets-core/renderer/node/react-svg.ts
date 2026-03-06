import { Canvas, createCanvas, loadImage } from '@napi-rs/canvas';
import { WidgetNodeVisualizationProps } from '../../types';
import { createVisualizationContext, createWidgetContext } from '../../utils/context';
import { scaleToFit } from '../../utils/vis';

export default async function renderSvg (props: WidgetNodeVisualizationProps) {
  const { data, visualizer, dpr, parameters, linkedData, colorScheme } = props;
  let { width, height } = props;
  width = visualizer.width ?? width;
  height = visualizer.height ?? height;

  const option = await visualizer.default(data, {
    ...createVisualizationContext({ width: width * dpr, height: height * dpr, dpr, colorScheme }),
    ...createWidgetContext('server', parameters, linkedData),
    createCanvas: () => new Canvas(1, 1) as any,
  });

  const svg = await import('react-dom/server').then((module) => module.renderToString(option));
  const image = await loadImage(`data:image/svg+xml;utf8,${svg}`);

  width *= dpr;
  height *= dpr;

  const { width: imageWidth, height: imageHeight } = scaleToFit(image.width, image.height, width, height);

  let canvas = createCanvas(imageWidth, imageHeight);
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.fillStyle = colorScheme === 'light' ? 'white' : 'rgb(36, 35, 49)';
  ctx.rect(0, 0, width, height);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
  return canvas;
}
