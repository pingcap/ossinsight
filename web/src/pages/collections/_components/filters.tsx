import React, { ChangeEvent, useState } from "react";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import { ArrowDownIcon, SearchIcon } from "@primer/octicons-react";
import InputAdornment from "@mui/material/InputAdornment";
import { useEventCallback } from "@mui/material";
import TextField from "@mui/material/TextField";

export const enum SortType {
  alphabetical = 'alphabetical',
  recent = 'recent'
}

export function useSearch() {
  const [search, setSearch] = useState('');

  const handleSearchChange = useEventCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  });

  return [search, (
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

export function useSorter() {
  const [sort, setSort] = useState<SortType>(SortType.alphabetical);

  const handleSortChange = (
    event: React.MouseEvent<HTMLElement>,
    sort: SortType,
  ) => {
    if (sort) {
      setSort(sort);
    }
  };

  return [sort, (
    <StyledToggleButtonGroup
      size="small"
      value={sort}
      onChange={handleSortChange}
      unselectable="off"
      exclusive
    >
      <ToggleButton value={SortType.alphabetical}>
        A - Z
      </ToggleButton>
      <Divider flexItem orientation="vertical" sx={{ width: '1px' }} color="#3c3c3c" />
      <ToggleButton value={SortType.recent}>
        NEW <ArrowDownIcon />
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