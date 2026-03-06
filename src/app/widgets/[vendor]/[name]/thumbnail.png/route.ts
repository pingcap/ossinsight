import { filterWidgetUrlParameters } from '@/app/widgets/[vendor]/[name]/utils';
import config from '@/site.config';
import { apiEvent, autoParams, serverSendGaMeasurementEvent } from '@/utils/ga';
import { resolveImageSizeConfig } from '@/utils/siteConfig';
import { createDefaultComposeLayout, isWidget, widgetDatasourceFetcher, widgetMetadataGenerator, widgetParameterDefinitions, widgetVisualizer } from '@/utils/widgets';
import { Canvas } from '@napi-rs/canvas';
import { resolveExpressions } from '@/lib/widgets-core/parameters/resolveExpressions';
import { resolveParameters } from '@/lib/widgets-core/parameters/resolver';
import render from '@/lib/widgets-core/renderer/node';
import renderCompose from '@/lib/widgets-core/renderer/node/compose';
import { createLinkedDataContext, createVisualizationContext, createWidgetBaseContext, createWidgetContext } from '@/lib/widgets-core/utils/context';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ vendor: string, name: string }> };

export async function GET (request: NextRequest, context: RouteContext) {
  const { vendor, name: paramName } = await context.params;

  if (vendor !== 'official') {
    notFound();
  }

  const name = `@ossinsight/widget-${decodeURIComponent(paramName)}`;

  if (!isWidget(name)) {
    notFound();
  }

  const datasource = widgetDatasourceFetcher(name);
  const params = await widgetParameterDefinitions(name);
  const visualizer = await widgetVisualizer(name);
  const generateMetadata = await widgetMetadataGenerator(name);

  const parameters: any = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!filterWidgetUrlParameters(name, key)) {
      return;
    }
    parameters[key] = value;
  });

  Object.assign(parameters, resolveExpressions(params));

  const paramDef = await widgetParameterDefinitions(name);
  const linkedData = await resolveParameters(paramDef, parameters);

  const baseCtx = createWidgetBaseContext('server', parameters);

  serverSendGaMeasurementEvent([apiEvent('visit_thumbnail_png', {
    widget_name: name,
    title: generateMetadata({
      ...createWidgetBaseContext('server', parameters),
      ...createLinkedDataContext(linkedData),
    }).title,
    ...autoParams('widget_param_', parameters),
  }, request)]);

  const data = await datasource(createWidgetBaseContext('server', parameters));

  const colorScheme = request.nextUrl.searchParams.get('color_scheme') ?? 'dark';

  const size = request.nextUrl.searchParams.get('image_size') ?? 'default';
  let width: number;
  let height: number;
  let dpr: number;
  const isDynamicHeight = !!(size === 'auto' && visualizer.computeDynamicHeight);
  if (isDynamicHeight) {
    width = 960;
    height = visualizer.computeDynamicHeight!(data);
    dpr = 2;
  } else {
    const resolved = resolveImageSizeConfig(config, size, visualizer.grid);
    width = visualizer.width ?? resolved.width;
    height = visualizer.height ?? resolved.height;
    dpr = resolved.dpr ?? 2;
  }

  const renderCtx = {
    ...createVisualizationContext({ width, height, dpr, colorScheme }),
    ...createWidgetContext('server', parameters, linkedData),
  };

  let canvas: Canvas;

  if (visualizer.type !== 'compose') {
    // Use compose to render all others images temporary.
    canvas = await renderCompose({
      width,
      height,
      dpr,
      type: 'compose',
      visualizer: createDefaultComposeLayout(name, data, {
        generateMetadata,
        ctx: renderCtx,
        isDynamicHeight,
      }),
      data,
      parameters,
      linkedData,
      colorScheme,
      sizeName: size,
      root: true,
    });
  } else {
    canvas = await render({
      type: visualizer.type,
      data,
      visualizer,
      width,
      height,
      dpr: dpr,
      parameters,
      linkedData,
      colorScheme,
      sizeName: size,
      root: true,
    });
  }

  const pngBuffer = canvas.toBuffer('image/png');
  return new NextResponse(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}

export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-cache';
