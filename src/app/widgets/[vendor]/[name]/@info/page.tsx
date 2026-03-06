import { makeLinkedData, resolveWidgetSearchParams, widgetPageParams, WidgetPageProps, widgetSignature } from '@/app/widgets/[vendor]/[name]/utils';
import { ServerWidgetInfo } from '@/components/Widget/server/Info';
import { Suspense } from 'react';

export default async function InfoSection (props: WidgetPageProps) {
  const params = await props.params;
  const searchParams = resolveWidgetSearchParams(await props.searchParams);
  const { name } = widgetPageParams(params);
  const signature = widgetSignature(params, searchParams);
  const linkedData = makeLinkedData(name, searchParams);

  return (
    <Suspense key={signature} fallback="loading...">
      <ServerWidgetInfo name={name} linkedDataPromise={linkedData} searchParams={searchParams} />
    </Suspense>
  );
}
