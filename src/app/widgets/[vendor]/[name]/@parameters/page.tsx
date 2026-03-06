import { getExcludeWidgetParameters, makeLinkedData, resolveWidgetSearchParams, widgetPageParams, WidgetPageProps, widgetSignature } from '@/app/widgets/[vendor]/[name]/utils';
import { ServerParameters } from '@/components/Widget/server';
import { Suspense } from 'react';

export default async function ParametersSection (props: WidgetPageProps) {
  const params = await props.params;
  const searchParams = resolveWidgetSearchParams(await props.searchParams);
  const { name } = widgetPageParams(params);
  const signature = widgetSignature(params, searchParams);
  const linkedData = makeLinkedData(name, searchParams);

  const excludeParameters = getExcludeWidgetParameters(name);
  return (
    <Suspense key={signature} fallback="loading...">
      <ServerParameters name={name} linkedDataPromise={linkedData} excludeParameters={excludeParameters} />
    </Suspense>
  );
}
