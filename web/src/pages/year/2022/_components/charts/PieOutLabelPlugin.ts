import {
  ArcElement,
  ArcProps,
  Chart,
  ChartArea,
  ChartConfiguration,
  ChartDataset,
  ChartMeta,
  Color,
  DoughnutController,
  PieController,
  Plugin,
  Point,
} from "chart.js/auto";
import { fontString } from "chart.js/helpers";
import { ChartType, FontSpec, PieOutLabelOptions } from "chart.js";
import { DeepPartial } from "chart.js/types/utils";


const SUPPORT_TYPES = ['pie', 'doughnut'];

function isPieChart(chart: Chart) {
  return (chart.config as ChartConfiguration).type === 'pie';
}

function isPieLike<TData>(chart: Chart, dataset: ChartDataset<any, TData>): dataset is ChartDataset<'pie' | 'doughnut', TData> {
  return isPieChart(chart) || SUPPORT_TYPES.indexOf(dataset.type) !== -1;
}

declare module 'chart.js' {
  type PieOutLabelOptions = DeepPartial<{
    label: {
      color: string
      font: FontSpec
    },
    value: {
      color: string
      font: FontSpec
    },
    lineThickness: number
  }>

  interface PluginOptionsByType<TType extends ChartType> {
    outlabel: PieOutLabelOptions;
  }
}

const PieOutLabelPlugin: Plugin = {
  id: 'pie-out-label-plugin',
  beforeInit(chart: Chart) {
    chart.options.layout.padding = {
      left: 160,
      right: 160,
      top: 0,
      bottom: 0,
    };
    chart.options.plugins.legend.display = false;
    chart.options.plugins.tooltip.enabled = false;
  },
  resize(chart: Chart, { size }) {
    const vertical = size.width < size.height * 1.5
    if (vertical) {
      chart.options.layout.padding = {
        left: 10,
        right: 10,
        top: 60,
        bottom: 60,
      }
    }
  },
  beforeDraw(chart: Chart): boolean | void {
    chart.data.datasets
      .forEach((dataset, i) => {
        if (isPieLike(chart, dataset)) {
          // Start here
          const meta: ChartMeta<ArcElement<ArcProps, any>> = chart.getDatasetMeta(i) as any;
          const max = Math.max(...dataset.data as number[])
          meta.data.forEach((datapoint, i) => {
            (datapoint as unknown as ArcProps).outerRadius = Math.pow(dataset.data[i] as number / max, 0.2) * (meta.controller as PieController).outerRadius
          })
        }
      });
  },
  afterDatasetDraw(chart: Chart) {
    const vertical = chart.width < chart.height * 1.5
    const options = chart.options.plugins.outlabel;

    chart.data.datasets
      .forEach((dataset, i) => {
        if (isPieLike(chart, dataset)) {
          // Start here
          const meta: ChartMeta<ArcElement<ArcProps, any>> = chart.getDatasetMeta(i) as any;
          const maxOuterRadius = (meta.controller as PieController).outerRadius
          meta.data.forEach((datapoint, i) => {
            const {
              x,
              y,
              startAngle,
              endAngle,
              outerRadius,
            } = datapoint.getProps(['startAngle', 'endAngle', 'x', 'y', 'outerRadius']);
            const c = { x, y };
            const angle = (startAngle + endAngle) / 2;
            const point = getPointOnArc(c, outerRadius, angle);

            const ctx = chart.ctx;
            const arcPosition = getArcPosition(angle);

            // Compute three path points
            let p0 = moveX(point, arcPosition.left, 20);
            let p1 = moveX(p0, arcPosition.left, vertical ? 30 : (120 + Math.abs(Math.cos(angle)) * (maxOuterRadius - outerRadius)));
            let p2 = moveY(p1, arcPosition.top, vertical ? -(40 + Math.abs(Math.sin(angle)) * (maxOuterRadius - outerRadius)) : 25);

            ctx.beginPath();
            ctx.lineWidth = options.lineThickness as number;
            ctx.strokeStyle = datapoint.options.backgroundColor as Color;

            ctx.moveTo(p0.x, p1.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            drawText(options, ctx, p2, arcPosition, vertical, chart.data.labels[i] as never, `${dataset.data[i]}%`);
          });
        }
      });
  },
};

type ArcPosition = {
  left: boolean
  top: boolean
}

function getCenter({
  top,
  left,
  height,
  width,
  right,
  bottom,
}: ChartArea, controller: PieController | DoughnutController): Point {
  const x = left + width / 2 + controller.offsetX;
  const y = top + height / 2 + controller.offsetY;
  return { x, y };
}

function getPointOnArc(center: Point, radius: number, arc: number): Point {
  return { x: center.x + radius * Math.cos(arc), y: center.y + radius * Math.sin(arc) };
}

function getArcPosition(arc: number): { top: boolean, left: boolean } {
  arc = arc % (Math.PI * 2);
  return {
    top: arc > Math.PI / 2 && arc <= Math.PI / 2 * 3,
    left: arc > Math.PI,
  };
}

function moveX(p: Point, left: boolean, distance: number): Point {
  return {
    x: p.x + (left ? -distance : distance),
    y: p.y,
  };
}

function moveY(p: Point, top: boolean, distance: number): Point {
  return {
    x: p.x,
    y: p.y + (top ? distance : -distance),
  };
}

function drawText(options: PieOutLabelOptions, ctx: CanvasRenderingContext2D, p: Point, position: ArcPosition, vertical: boolean, label: string, value: any) {
  // Draw label
  ctx.textAlign = position.left !== vertical ? "end" : "start";
  ctx.textBaseline = position.top ? "hanging" : "alphabetic";
  ctx.font = fontString(options.label.font.size, options.label.font.weight, options.label.font.family);
  ctx.fillStyle = options.label.color;
  let x = p.x + (position.left ? 20 : -20) + 40 * (vertical ? position.top ? -1 : 1 : 0);
  let y = p.y + (position.top ? 4 : -4) + 65 * (vertical ? position.top ? -1 : 1 : 0);
  ctx.fillText(label, x, y);

  // Dray value
  const metrics = ctx.measureText(label);
  y += position.top ? metrics.actualBoundingBoxDescent + 4 : -metrics.actualBoundingBoxAscent - 8;
  ctx.font = fontString(options.value.font.size, options.value.font.weight, options.value.font.family);
  ctx.fillStyle = options.value.color;
  ctx.fillText(value, x, y);
}

export default PieOutLabelPlugin;