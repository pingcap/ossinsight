import { useEventCallback } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import React, { useMemo, useState } from 'react';
import useUrlSearchState, { stringParam } from '../../../hooks/url-search-state';
import IconTab from '../components/IconTab';
import _dimensions, { Dimension } from '../dimensions';

export function useDimensionTabs(searchKey: string, assurePrefix = false) {
  const dimensions = useMemo(() => _dimensions.filter(d => assurePrefix ? !!d.prefix : true), [assurePrefix])
  const [dimension, setDimension] = useUrlSearchState<Dimension>(searchKey, {
    defaultValue: dimensions[0],
    serialize: d => d.search,
    deserialize: k => dimensions.find(dimension => dimension.search === k) ?? dimensions[0],
  })

  const handleChangeDimension = useEventCallback((e, dimensionKey: string) => {
    setDimension(dimensions.find(dimension => dimension.key === dimensionKey));
  });

  const tabs = (
    <Tabs value={dimension.key} onChange={handleChangeDimension} variant="scrollable" scrollButtons="auto"
          allowScrollButtonsMobile>
      {dimensions.map(dimension => (
        <IconTab key={dimension.key} value={dimension.key} icon={dimension.icon}>
          {dimension.title}
        </IconTab>
      ))}
    </Tabs>
  );

  return {
    dimension,
    tabs,
  };
}