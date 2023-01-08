import { ChartResult } from '@site/src/api/explorer';
import React, { createElement, FC, ReactNode, useMemo } from 'react';
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
import { useValidData } from '@site/src/pages/explore/_components/charts/utils';
import { isNullish, notNullish } from '@site/src/utils/value';
import BadDataAlert from '@site/src/pages/explore/_components/charts/BadDataAlert';
import { unstable_serialize } from 'swr';

registerThemeDark();

type ChartConfig = {
  Chart: FC<ChartsProps>;
  requiredFields: string[];
  optionalFields?: string[];
};

interface ChartsProps extends ChartResult {
  data: Array<Record<string, any>>;
  fields?: any[];
}

const CHARTS_CONFIG: Record<string, ChartConfig> = {
  LineChart: {
    Chart: LineChart,
    requiredFields: ['x', 'y'],
  },
  BarChart: {
    Chart: BarChart,
    requiredFields: ['x', 'y'],
  },
  PieChart: {
    Chart: PieChart,
    requiredFields: ['value', 'label'],
  },
  PersonalCard: {
    Chart: PersonalCard,
    requiredFields: ['user_login'],
  },
  RepoCard: {
    Chart: RepoCard,
    requiredFields: ['repo_name'],
  },
  Table: {
    Chart: TableChart,
    requiredFields: [],
  },
  NumberCard: {
    Chart: NumberCard,
    requiredFields: ['value'],
    optionalFields: ['label'],
  },
  MapChart: {
    Chart: MapChart,
    requiredFields: ['country_code', 'value'],
  },
};

export function Charts (props: ChartsProps) {
  const { config, fields } = useMemo(() => {
    const config = CHARTS_CONFIG[props.chartName];
    const fields = (config?.requiredFields ?? []).map(f => props[f]);
    return { config, fields };
  }, [unstable_serialize(props)]);

  const validData = useValidData(props.data, fields);

  let alertNode: ReactNode;
  let chartNode: ReactNode;

  if (isNullish(config)) {
    alertNode = <BadDataAlert title={`AI has generated an unknown chart type '${props.chartName}'`} />;
  }

  if (props.data.length === 0) {
    alertNode = <EmptyDataAlert />;
  } else if (validData.length > 0) {
    if (notNullish(config)) {
      chartNode = createElement(config.Chart, { ...props, data: validData });
    }
  } else {
    alertNode = <BadDataAlert title="AI has generated invalid chart info" />;
  }

  return (
    <>
      {alertNode}
      {chartNode}
    </>
  );
}
