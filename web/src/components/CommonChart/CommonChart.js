import React, {useContext, useMemo} from "react";
import Divider from "@mui/material/Divider";
import {LocalizationProvider} from "@mui/lab";
import DateAdapter from '@mui/lab/AdapterLuxon';
import Head from '@docusaurus/Head';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {useInView} from "react-intersection-observer";
import InViewContext from '../InViewContext'
import GroupSelectContext from "../GroupSelect/GroupSelectContext";
import {groups} from "../GroupSelect/groups";
import CommonChartContext from './context'
import useVisibility from "../../hooks/visibility";

function CommonChart({chart: rawChart, noSearch, comparing, shareInfo, ...rest}) {
  const visible = useVisibility()
  const { inView, ref } = useInView({ fallbackInView: true })
  const chart = useMemo(() => {
    if (typeof rawChart === 'string') {
      return require('../RemoteCharts/' + rawChart + '/index.js').default
    } else {
      return rawChart
    }
  }, [rawChart])

  const {form, query} = chart.useForm({ noSearch })

  const { group } = useContext(GroupSelectContext)

  const comparingProps = (comparing && group) ? {
    compareName: group,
    compareId: groups[group]?.repoIds
  } : {}

  const child = React.createElement(chart.Chart, {
    ...query,
    ...rest,
    ...comparingProps
  })

  return (
    <LocalizationProvider dateAdapter={DateAdapter}>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Head>
      <div ref={ref} data-common-chart={true}>
        <InViewContext.Provider value={{ inView: visible && inView }}>
          {form}
          {form && <Divider sx={{my: 2}} />}
          <CommonChartContext.Provider value={{shareInfo}}>
            {child}
          </CommonChartContext.Provider>
        </InViewContext.Provider>
      </div>
    </LocalizationProvider>
  )
}

export default function (props) {
  return <BrowserOnly fallback={<div style={{ minHeight: 400 }}/>}>{() => <CommonChart {...props} />}</BrowserOnly>
}
