import { filterWidgetUrlParameters } from '@/app/widgets/[vendor]/[name]/utils';
import { isWidget, widgetMeta, widgetMetadataGenerator, widgetParameterDefinitions } from '@/utils/widgets';
import { resolveExpressions } from '@/lib/widgets-core/parameters/resolveExpressions';
import { resolveParameters } from '@/lib/widgets-core/parameters/resolver';
import { createLinkedDataContext, createWidgetBaseContext } from '@/lib/widgets-core/utils/context';
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

  const { description, keywords } = widgetMeta(name)

  const generateMetadata = await widgetMetadataGenerator(name);

  const parameters: any = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!filterWidgetUrlParameters(name, key)) {
      return;
    }
    parameters[key] = value;
  });


  const paramDef = await widgetParameterDefinitions(name);
  Object.assign(parameters, resolveExpressions(paramDef));
  const linkedData = await resolveParameters(paramDef, parameters);

  const metadata = generateMetadata({
    ...createWidgetBaseContext('server', parameters),
    ...createLinkedDataContext(linkedData),
  });

  return NextResponse.json({
    imageUrl: request.url.replace('manifest.json', 'thumbnail.png'),
    pageUrl: request.url.replace('/manifest.json', ''),

    title: metadata.title,
    description: metadata.description ?? description,
    keywords: metadata.keywords ?? keywords,
  });
}

export const dynamic = 'force-dynamic';
