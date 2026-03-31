import type { WidgetVisualizerContext } from '@/lib/charts-types';
import cloud from 'd3-cloud';

export interface WordCloudDataItem {
  text: string;
  size: number;
  color?: string;
}

export interface WordCloudOptions<Params> {
  /** Extract the display text from a data point. */
  getText: (item: any) => string;
  /** Determine the value index (size field name) from context parameters. */
  getValueIndex: (ctx: WidgetVisualizerContext<Params>) => string | undefined;
  /** Return a color for dataset index `i`. */
  getColor: (i: number, ctx: WidgetVisualizerContext<Params>) => string;
  /** Sort comparator for the merged data array (default: ascending by size). */
  sortComparator?: (a: WordCloudDataItem, b: WordCloudDataItem) => number;
}

const visible = [0x09, 0x20];

export function esc(text: string): string {
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code <= 32 || code === 255) {
      if (visible.includes(code)) {
        res += text.charAt(i);
      }
    } else {
      res += text.charAt(i);
    }
  }

  res += '';
  return res;
}

function transformData(
  data: any[],
  valueIndex: string | undefined,
  getText: (item: any) => string,
): WordCloudDataItem[] {
  if (!valueIndex) {
    return [];
  }
  return data.flatMap((item) => ({
    text: esc(getText(item)),
    size: (item as any)[valueIndex],
  }));
}

export async function renderWordCloud<Params>(
  input: [any[], any[] | undefined],
  ctx: WidgetVisualizerContext<Params>,
  options: WordCloudOptions<Params>,
  signal?: AbortSignal,
) {
  let width = ctx.width;
  let height = ctx.height;
  let viewBoxWidth = width;
  let viewBoxHeight = height;

  if (ctx.runtime === 'server') {
    viewBoxWidth /= ctx.dpr;
    viewBoxHeight /= ctx.dpr;
  }

  const minFontSize = 14;
  const maxFontSize = Math.min(viewBoxHeight, viewBoxWidth) / 4;

  const valueIndex = options.getValueIndex(ctx);
  const sortComparator = options.sortComparator ?? ((a, b) => a.size - b.size);

  const data: WordCloudDataItem[] = input
    .flatMap((dataset, i) =>
      transformData(dataset ?? [], valueIndex, options.getText).map((item) => {
        item.color = options.getColor(i, ctx);
        return item;
      }),
    )
    .sort(sortComparator);

  const min = Math.min(...data.map((d) => d.size));
  const max = Math.max(...data.map((d) => d.size));

  data.forEach((word) => {
    if (max === min) {
      word.size = (minFontSize + maxFontSize) / 4;
      return word;
    }
    word.size =
      ((word.size - min) * (maxFontSize - minFontSize)) / (max - min) +
      minFontSize;
    return word;
  });

  const words: cloud.Word[] = await new Promise<cloud.Word[]>(
    (resolve, reject) => {
      const layout = cloud()
        .canvas(ctx.createCanvas)
        .size([ctx.width, ctx.height])
        .words(data)
        .padding(2)
        .rotate(0)
        .font('Heiti TC')
        .fontSize(function (d: any) {
          return d.size;
        })
        .random(() => 0.5)
        .on('end', (word: any) => resolve(word));
      layout.start();
      if (signal) {
        signal.onabort = () => {
          layout.stop();
          reject(signal.reason);
        };
      }
    },
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${-viewBoxWidth / 2} ${-viewBoxHeight / 2} ${viewBoxWidth} ${viewBoxHeight}`}
    >
      <g>
        {words.map((word, i) => (
          <text
            key={i}
            fill={'#dd6b66'}
            fontSize={`${word.size}px`}
            fontFamily="Heiti TC"
            textAnchor="middle"
            transform={`translate(${[word.x, word.y]})rotate(${word.rotate})`}
          >
            {word.text}
          </text>
        ))}
      </g>
    </svg>
  );
}
