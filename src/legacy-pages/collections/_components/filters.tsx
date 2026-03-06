import React, { ChangeEvent, useState } from 'react';
import { ArrowDownIcon, SearchIcon } from '@primer/octicons-react';
import {
  useEventCallback,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  styled,
  InputAdornment,
  TextField,
} from '@mui/material';

export const enum SortType {
  alphabetical = 'alphabetical',
  recent = 'recent',
}

export function useSearch (): readonly [search: string, Search: JSX.Element] {
  const [search, setSearch] = useState('');

  const handleSearchChange = useEventCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  });

  return [search, (
    // eslint-disable-next-line react/jsx-key
    <TextField
      variant="outlined"
      size="small"
      placeholder="Search..."
      value={search}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  )] as const;
}

export function useSorter (): readonly [sort: SortType, Sort: JSX.Element] {
  const [sort, setSort] = useState<SortType>(SortType.recent);

  const handleSortChange = (
    event: React.MouseEvent<HTMLElement>,
    sort: SortType,
  ) => {
    if (sort) {
      setSort(sort);
    }
  };

  return [sort, (
    // eslint-disable-next-line react/jsx-key
    <StyledToggleButtonGroup
      size="small"
      value={sort}
      onChange={handleSortChange}
      unselectable="off"
      exclusive
    >
      <ToggleButton value={SortType.recent}>
        NEW <ArrowDownIcon />
      </ToggleButton>
      <Divider flexItem orientation="vertical" sx={{ width: '1px' }} color="#3c3c3c" />
      <ToggleButton value={SortType.alphabetical}>
        A - Z
      </ToggleButton>
    </StyledToggleButtonGroup>
  ),
  ] as const;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      margin: theme.spacing(0.5),
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));
