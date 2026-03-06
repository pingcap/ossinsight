import { createCanvas } from '@napi-rs/canvas';
import { init } from 'echarts';
import { WidgetNodeVisualizationProps } from '../../types';
import { createVisualizationContext, createWidgetContext } from '../../utils/context';
import '../echarts-map';
import '../echarts-theme';

export default function renderEcharts (props: WidgetNodeVisualizationProps) {
  const { width, height, dpr, visualizer, data, parameters, linkedData, colorScheme } = props;
  const dynamicHeight = visualizer.computeDynamicHeight?.(data);
  let canvas = createCanvas(width, dynamicHeight ?? height);

  const option = visualizer.default(data, {
    ...createVisualizationContext({ width, height, dpr, colorScheme }),
    ...createWidgetContext('server', parameters, linkedData),
  });

  const echarts = init(canvas as any, colorScheme, {
    width: width,
    height: (dynamicHeight ?? height),
    devicePixelRatio: dpr,
  });

  echarts.setOption({ ...option, animation: false });

  if (dynamicHeight) {
    const realCanvas = createCanvas(width * dpr, height * dpr);
    const ctx = realCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, width * dpr, height * dpr, 0, 0, width * dpr, height * dpr);
    canvas = realCanvas;
  }

  return canvas;
}
