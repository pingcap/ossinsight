import { useEventCallback, Tabs, Button, ButtonGroup, Stack, Box } from '@mui/material';
import React, { useMemo, useState } from 'react';
import useUrlSearchState from '../../../hooks/url-search-state';
import IconTab from '../components/IconTab';
import _dimensions, {
  Dimension,
  collectionDisplayType,
  CollectionDateTypeEnum,
} from '../dimensions';

export function useDimensionTabs (searchKey: string, assurePrefix = false) {
  const dimensions = useMemo(() => _dimensions.filter(d => assurePrefix ? !!d.prefix : true), [assurePrefix]);
  const [dimension, setDimension] = useUrlSearchState<Dimension>(searchKey, {
    defaultValue: dimensions[0],
    serialize: d => d.search,
    deserialize: k => dimensions.find(dimension => dimension.search === k) ?? dimensions[0],
  });
  const [dateType, setDateType] = useState(CollectionDateTypeEnum.Last28Days);

  const handleChangeDimension = useEventCallback((e, dimensionKey: string) => {
    setDimension(dimensions.find(dimension => dimension.key === dimensionKey) ?? dimensions[0]);
  });

  const handleChangeDateType = (targetType: CollectionDateTypeEnum) => () => {
    setDateType(targetType);
  };

  const tabs = (
    <Stack
      direction={{ xs: 'column', sm: 'row', md: 'column', lg: 'row' }}
      justifyContent="space-between"
      gap="1rem"
      flexWrap="wrap"
    >
      <Tabs
        value={dimension.key}
        onChange={handleChangeDimension}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {dimensions.map((dimension) => (
          <IconTab
            key={dimension.key}
            value={dimension.key}
            icon={dimension.icon}
          >
            {dimension.title}
          </IconTab>
        ))}
      </Tabs>
      {searchKey === 'monthly-rankings' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ButtonGroup
            variant="outlined"
            aria-label="display type"
            size="small"
          >
            {collectionDisplayType.map((colType) => {
              return (
                <Button
                  key={colType.type}
                  sx={{ textTransform: 'none' }}
                  onClick={handleChangeDateType(colType.type)}
                  variant={colType.type === dateType ? 'contained' : 'outlined'}
                >
                  {colType.label}
                </Button>
              );
            })}
          </ButtonGroup>
        </Box>
      )}
    </Stack>
  );

  return {
    dimension,
    tabs,
    dateType,
  };
}
