import { ChartResult } from '@site/src/api/explorer';
import React from 'react';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PersonalCard from './PersonalCard';
import RepoCard from './RepoCard';
import TableChart from './TableChart';

export function Charts (props: ChartResult & { data: Array<Record<string, any>>, fields?: any[] }) {
  switch (props.chartName) {
    case 'LineChart':
      return <LineChart {...props} />;
    case 'BarChart':
      return <BarChart {...props} />;
    case 'PersonalCard':
      return <PersonalCard {...props} />;
    case 'RepoCard':
      return <RepoCard {...props} />;
    case 'Table':
      return <TableChart {...props} />;
    case 'PieChart':
    case 'MapChart':
      // TODO: WIP
      return null;
    default:
      return null;
  }
}
