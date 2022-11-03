import React, { ChangeEventHandler, useState } from 'react';
import { CompanyInfo, useCompanyList } from './hooks';
import {
  ListItem,
  ListItemText,
  Popper,
  useEventCallback,
  Autocomplete,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useDebounced } from '../../../components/CompareHeader/useSearchRepo';
import { Search } from '@mui/icons-material';

interface SearchCompanyProps {
  value: CompanyInfo | null;
  onChange: (value: CompanyInfo | null) => void;
}

const SearchCompany = ({ value, onChange }: SearchCompanyProps) => {
  const [keyword, setKeyword] = useState('');
  const searchKey = useDebounced(keyword, 500);
  const { data: companies, loading } = useCompanyList(searchKey);

  const handleChange = useEventCallback((_: any, value: CompanyInfo) => {
    onChange(value);
  });

  const handleInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useEventCallback((e) => {
    setKeyword(e.target.value);
  });

  return (
    <Autocomplete<CompanyInfo, undefined, undefined, false>
      value={value}
      onChange={handleChange}
      id="combo-box-demo"
      loading={loading}
      options={companies ?? []}
      fullWidth
      openOnFocus
      getOptionLabel={option => option.name}
      renderOption={(props, option, state) => (
        <ListItem {...props} selected={state.selected}>
          <ListItemText primary={option.name} secondary={`${option.total} Developers`} />
        </ListItem>
      )}
      renderInput={({ InputProps, ...params }) => (
        <TextField
          {...params}
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
          }}
          onChange={handleInputChange}
          InputProps={{
            ...InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Search htmlColor="#333" />
              </InputAdornment>
            ),
            placeholder: 'Search by company name',
            sx: {
              color: '#333',
              '::placeholder': {
                color: '#dfdfdf',
              },
              borderRadius: 2,
            },
          }}
        />
      )}
      PopperComponent={CustomPopper}
    />
  );
};

const CustomPopper = props => <Popper {...props} placement="bottom-start" />;

export default SearchCompany;
