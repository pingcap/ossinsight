import { LinkedDataContext } from '@/components/Context/LinkedData';
import { useWidget } from '@/components/EmbeddedWidget/useWidget';
import Loading from '@/components/Widget/loading';
import { usePerformanceOptimizedNetworkRequest } from '@/utils/usePerformanceOptimizedNetworkRequest';
import { fetchWidgetData } from '@/utils/widgets';
import { Scale } from '@/lib/ui/components/transitions';
import { CSSProperties, Suspense, useContext } from 'react';

export function EmbeddedWidget ({
  className, style, name, params,
}: {
  className?: string;
  style?: CSSProperties;
  name: string;
  params: Record<string, string | string[]>;
}) {

  const linkedData = useContext(LinkedDataContext);
  const {
    result: wd,
    ref,
  } = usePerformanceOptimizedNetworkRequest(
    fetchWidgetData,
    name, params, linkedData,
  );

  const Widget = useWidget(name);

  if (wd) {
    return (
      <Suspense fallback={<div className={className} style={style} ref={ref}><Loading /></div>}>
        <Scale>
          <Widget ref={ref} className={className} style={style} name={name} data={wd.data} linkedData={wd.linkedData} params={wd.parameters} />
        </Scale>
      </Suspense>
    );
  } else {
    return <div className={className} style={style} ref={ref}><Loading /></div>;
  }
}