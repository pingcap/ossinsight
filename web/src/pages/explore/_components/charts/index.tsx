import { ChartResult } from '@site/src/api/explorer';
import React from 'react';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import PersonalCard from './PersonalCard';
import RepoCard from './RepoCard';
import TableChart from './TableChart';
import NumberCard from './NumberCard';
import MapChart from './MapChart';
import { registerThemeDark } from '@site/src/components/BasicCharts';
import EmptyDataAlert from '@site/src/pages/explore/_components/charts/EmptyDataAlert';

registerThemeDark();

export function Charts (props: ChartResult & { data: Array<Record<string, any>>, fields?: any[] }) {
  if (props.data.length === 0) {
    return <EmptyDataAlert />;
  }

  switch (props.chartName) {
    case 'LineChart':
      return <LineChart {...props} />;
    case 'BarChart':
      return <BarChart {...props} />;
    case 'PieChart':
      return <PieChart {...props} />;
    case 'PersonalCard':
      return <PersonalCard {...props} />;
    case 'RepoCard':
      return <RepoCard {...props} />;
    case 'Table':
      return <TableChart {...props} />;
    case 'NumberCard':
      return <NumberCard {...props} />;
    case 'MapChart':
      return <MapChart {...props} />;
    default:
      return <>{`Unknown chart type '${props.chartName}'`}</>;
  }
}
