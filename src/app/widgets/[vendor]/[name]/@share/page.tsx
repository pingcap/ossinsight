import { Share } from '@/components/Share';
import { widgetParameterDefinitions } from '@/utils/widgets';
import { resolveParameters } from '@/lib/widgets-core/parameters/resolver';
import { Suspense } from 'react';
import type { WidgetPageProps } from '../utils';
import { resolveWidgetSearchParams, widgetPageParams, widgetSignature } from '../utils';

export default async function ShareSection (props: WidgetPageProps) {
  const params = await props.params;
  const searchParams = resolveWidgetSearchParams(await props.searchParams);
  const { name } = widgetPageParams(params);
  const signature = widgetSignature(params, searchParams);
  const linkedData = widgetParameterDefinitions(name).then(paramDef => resolveParameters(paramDef, searchParams));

  return (
    <Suspense key={signature} fallback="loading...">
      <Share name={name} params={params} searchParams={searchParams} linkedDataPromise={linkedData} />
    </Suspense>
  );
}
