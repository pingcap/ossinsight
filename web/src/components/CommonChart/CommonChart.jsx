import React, { useContext, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import InViewContext from '../InViewContext';
import GroupSelectContext from '../GroupSelect/GroupSelectContext';
import { groups } from '../GroupSelect/groups';
import CommonChartContext from './context';
import useVisibility from '../../hooks/visibility';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Divider } from '@mui/material';

// eslint-disable-next-line react/prop-types
function CommonChart ({ chart: rawChart, noSearch, comparing, shareInfo, ...rest }) {
  const visible = useVisibility();
  const { inView, ref } = useInView({ fallbackInView: true });
  const chart = useMemo(() => {
    if (typeof rawChart === 'string') {
      return require('../RemoteCharts/' + rawChart + '/index.js').default;
    } else {
      return rawChart;
    }
  }, [rawChart]);

  const { form, query } = chart.useForm({ noSearch });

  const { group } = useContext(GroupSelectContext);

  const comparingProps = (comparing && group)
    ? {
        compareName: group,
        compareId: groups[group]?.repoIds
      }
    : {};

  const child = React.createElement(chart.Chart, {
    ...query,
    ...rest,
    ...comparingProps
  });

  return (
    <div ref={ref} data-common-chart={true}>
      <InViewContext.Provider value={{ inView: visible && inView }}>
        {form}
        {form && <Divider sx={{ my: 2 }} />}
        <CommonChartContext.Provider value={{ shareInfo }}>
          {child}
        </CommonChartContext.Provider>
      </InViewContext.Provider>
    </div>
  );
}

export default function (props) {
  return <BrowserOnly fallback={<div style={{ minHeight: 400 }} />}>{() => <CommonChart {...props} />}</BrowserOnly>;
}
