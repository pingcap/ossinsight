import { useEventCallback } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import React, { useState } from 'react';
import IconTab from '../components/IconTab';
import dimensions from '../dimensions';

export function useDimensionTabs() {
  const [dimension, setDimension] = useState(dimensions[0]);

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