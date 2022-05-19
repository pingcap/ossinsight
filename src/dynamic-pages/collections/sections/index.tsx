import React from 'react';
import HistorySection from './history';
import HistoryRankSection from './history-rank';
import HistorySortSection from './history-sort';
import MonthRankSection from './month-rank';

export default function Sections () {
  return (
    <>
      <MonthRankSection />
      <HistorySection />
      <HistorySortSection />
      <HistoryRankSection />
    </>
  )
}
