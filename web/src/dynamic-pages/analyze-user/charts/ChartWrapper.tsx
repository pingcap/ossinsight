import React, { createContext, ReactNode, RefObject, useEffect } from 'react';
import { EChartsType } from 'echarts/core';
import { useAnalyzeUserContext } from './context';
import { useHistory } from '@docusaurus/router';
import { RemoteData } from '../../../components/RemoteCharts/hook';
import { useDebugDialog } from '../../../components/DebugDialog';
import { nonEmptyArray, notNullish } from '@site/src/utils/value';
import { Box } from '@mui/material';

export interface ChartWrapperProps {
  title?: string;
  description?: string;
  href?: string;
  children: ReactNode;
  chart?: RefObject<EChartsType>;
  repo?: boolean;
  remoteData?: RemoteData<any, any>;
  loading?: boolean;
}

export interface ChartWrapperContextProps {
  title?: string;
  description?: string;
  href?: string;
}

function ChartWrapper ({ title, description, href, chart, repo, remoteData, loading = false, children }: ChartWrapperProps) {
  const { userId } = useAnalyzeUserContext();
  const history = useHistory();

  const { dialog, button } = useDebugDialog(remoteData);

  useEffect(() => {
    if (loading) {
      chart?.current?.showLoading('default', {
        color: 'rgb(255, 232, 149)',
        textColor: 'rgb(255, 232, 149)',
        maskColor: 'rgba(0, 0, 0, 0.3)',
      });
    } else {
      chart?.current?.hideLoading();
      chart?.current?.setOption({
        graphic: [{
          id: 'no-data',
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            opacity: (loading || nonEmptyArray(remoteData?.data)) ? 0 : undefined,
            fontSize: 16,
            fontWeight: 'bold',
            text: 'No relevant data yet',
            fill: '#7c7c7c',
          },
        }],
      });
    }
  }, [loading]);

  useEffect(() => {
    chart?.current?.resize({ width: 'auto' });

    chart?.current?.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100,
    });
  }, [userId]);

  useEffect(() => {
    if (!repo) {
      return;
    }
    if (notNullish(chart) && notNullish(chart.current)) {
      const clickHandler = params => {
        let name: string;
        if (/[xy]Axis/.test(params.componentType)) {
          name = params.value;
        } else {
          name = params.name;
        }
        if (/^[^/]+\/[^/]+$/.test(name)) {
          history.push(`/analyze/${name}`);
        }
      };
      chart.current.on('click', clickHandler);

      return () => {
        chart.current?.off('click', clickHandler);
      };
    }
  }, [repo]);

  return (
    <Box sx={{ mb: 4 }}>
      <ChartWrapperContext.Provider value={{ title, description, href }}>
        <Box display="flex" justifyContent="flex-end">
          {button}
        </Box>
        {children}
        {dialog}
      </ChartWrapperContext.Provider>
    </Box>
  );
}

export const ChartWrapperContext = createContext<ChartWrapperContextProps>({});

export default ChartWrapper;
