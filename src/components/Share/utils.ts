import { toWidgetPathname } from '@/components/Widget/utils';
import siteConfig from '@/site.config';
import { widgetMetadataGenerator, widgetVisualizer } from '@/utils/widgets';
import { ShareOptions } from '@/lib/ui/components/ShareBlock';
import { LinkedData } from '@/lib/widgets-core/parameters/resolver';
import { createWidgetContext } from '@/lib/widgets-core/utils/context';
import { VisualizerModule } from '@ossinsight/widgets-types';
import { getWidgetSize } from '@/lib/widgets-utils/utils';

export async function getOrigin () {
  if (typeof location !== 'undefined') {
    return location.origin;
  }

  const { headers } = require('next/headers');
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');
  if (!host) {
    return siteConfig.host;
  }

  return /^localhost:/.test(host) ? 'http://' + host : 'https://' + host;
}

export async function createShareInfo (fullName: string, linkedData: LinkedData, params: Record<string, string>): Promise<ShareOptions> {
  const generateMetadata = await widgetMetadataGenerator(fullName);

  const { title, keywords } = generateMetadata(
    createWidgetContext('client', params, linkedData),
  );

  const usp = new URLSearchParams(params);
  const imageUsp = new URLSearchParams(usp);

  const origin = await getOrigin();

  const visualizer = await widgetVisualizer(fullName);
  const width = resolveWidgetWidth(visualizer);
  imageUsp.set('image_size', resolveImageSize(visualizer));

  const pathname = toWidgetPathname(fullName);
  return {
    title: title || 'Untitled',
    url: `${origin}${pathname}?${usp.toString()}`,
    thumbnailUrl: `${origin}${pathname}/thumbnail.png?${imageUsp.toString()}`,
    keywords,
    imageWidth: width,
  };
}

function resolveWidgetWidth (visualizer: VisualizerModule<any, any, any, any>) {
  const { width, grid } = visualizer;

  if (grid) {
    const gridSize = getWidgetSize();

    return gridSize.widgetWidth(getMax(grid.cols));
  } else {
    return width ?? 720;
  }
}

function resolveImageSize (visualizer: VisualizerModule<any, any, any, any>) {
  if (visualizer.grid) {
    return `${getMax(visualizer.grid.rows)}x${getMax(visualizer.grid.cols)}`;
  } else {
    return 'auto';
  }
}

function getMax (value: number | { min: number, max: number }) {
  if (typeof value === 'number') {
    return value;
  }
  return value.max;
}
