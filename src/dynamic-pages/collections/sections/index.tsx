import React from 'react';
import { Collection, useCollection } from '../hooks/useCollection';
import HistorySection from './history';
import HistoryRankSection from './history-rank';
import HistorySortSection from './history-sort';
import MonthRankSection from './month-rank';
import { H1, P1 } from './typograpy';

export default function Sections ({ collection }: { collection: Collection}) {
  return (
    <>
      <H1>{collection.name}</H1>
      <P1>Collection description</P1>
      <MonthRankSection />
      <HistorySection />
      <HistorySortSection />
      <HistoryRankSection />
    </>
  )
}
