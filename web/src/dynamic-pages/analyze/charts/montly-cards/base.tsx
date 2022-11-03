import { Grid as XGrid } from '@djagger/echartsx/dist/components/option/gird';
import { Axis } from '@djagger/echartsx';
import React from 'react';

export const AxisBase = () => {
  return (
    <>
      <XGrid left={8} right={0} top={4} bottom={0} />
      <Axis.Category.X axisTick={{ show: false }} axisLabel={{ color: '#7c7c7c', fontSize: 8, interval: 6 }} />
      <Axis.Value.Y axisLabel={{ hideOverlap: true, color: '#7c7c7c', fontSize: 8 }} splitNumber={2} />
    </>
  );
};

const fmt = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export const formatDate = (date: string) => {
  const d = new Date(date);
  if (isNaN(d.getFullYear())) {
    return date;
  } else {
    return fmt.format(d);
  }
};
