import type { WidgetVisualizerContext } from '@/lib/charts-types';

// @ts-expect-error d3-cloud has no type declarations
import cloud from 'd3-cloud';

type Params = {
  owner_id: string;
  activity?: string;
  period?: string;
};

type ParticipantDataPoint = {
  organization_name: string;
  participants: number;
};

type StarDataPoint = {
  organization_name: string;
  stars: number;
};

type DataPoint = ParticipantDataPoint | StarDataPoint;

type Input = [DataPoint[], DataPoint[] | undefined];

function transformCompanyData (
  data: DataPoint[],
  valueIndex: string | undefined,
): { text: string, size: number, color?: string }[] {
  if (!valueIndex) {
    return [];
  }
  return data.flatMap((item, index) => ({
    text: esc(item.organization_name),
    size: (item as any)[valueIndex],
    color: undefined,
  }));
}

export default async function (
  input: Input,
  ctx: WidgetVisualizerContext<Params>,
  signal?: AbortSignal
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

  const valueIndex = ctx.parameters?.activity || 'participants';

  const generateData = () => {
    return input
      .flatMap((data, i) =>
        transformCompanyData(data ?? [], valueIndex).map((item) => {
          item.color = ['#dd6b66', '#759aa0'][i];
          return item;
        }),
      )
      .sort((a, b) => b.size - a.size);
  };

  const data = generateData();
  const min = Math.min(...data.map(d => d.size));
  const max = Math.max(...data.map(d => d.size));

  data.forEach(word => {
    if (max === min) {
      word.size = (minFontSize + maxFontSize) / 4;
      return word;
    }
    word.size = (word.size - min) * (maxFontSize - minFontSize) / (max - min) + minFontSize;
    return word;
  });


  const words: cloud.Word[] = await new Promise<cloud.Word[]>((resolve, reject) => {
    const layout = cloud()
      .canvas(ctx.createCanvas)
      .size([ctx.width, ctx.height])
      .words(data)
      .padding(2)
      .rotate(0)
      .font('Heiti TC')
      .fontSize(function (d: any) { return d.size; })
      .random(() => 0.5)
      .on('end', (word: any) => resolve(word));
    layout.start();
    if (signal) {
      signal.onabort = () => {
        layout.stop();
        reject(signal.reason);
      }
    }
  });

  return (
    <svg width={width} height={height} viewBox={`${-viewBoxWidth/2} ${-viewBoxHeight/2} ${viewBoxWidth} ${viewBoxHeight}`}>
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

const visible = [0x09, 0x20]

function esc (text: string): string {
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code <= 32 || code === 255) {
      if (visible.includes(code)) {
        res += text.charAt(i)
      }
    } else {
      res += text.charAt(i);
    }
  }

  res += '';
  return res;
}

export const type = 'react-svg';
export const asyncComponent = true;
