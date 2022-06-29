import { useHistory } from '@docusaurus/router';
import SearchIcon from '@mui/icons-material/Search';
import { ListItem, ListItemAvatar, ListItemText, useEventCallback } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import Popper from '@mui/material/Popper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SearchRepoInfo, UserInfo } from '@ossinsight/api';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { SearchType, useGeneralSearch } from './useGeneralSearch';

export interface GeneralSearchProps {
  contrast?: boolean;
  align?: 'left' | 'right' | 'center'
  size?: 'large'
}

type Option = SearchRepoInfo | UserInfo

const isOptionEqual = (a: Option, b: Option) => {
  return a.id === b.id;
};

const getOptionLabel = (option: Option) => (option as SearchRepoInfo).fullName || (option as UserInfo).login;

const useTabs = () => {
  const [type, setType] = useState<SearchType>('repo');

  const handleTypeChange = useEventCallback((_: any, type: SearchType) => {
    setType(type);
  });

  const tabs = useMemo(() => {
    return (
      <Tabs value={type} onChange={handleTypeChange}>
        <Tab label="Repo" value="repo" />
        <Tab label="User" value="user" />
      </Tabs>
    );
  }, [type]);

  return [type, tabs] as const;
};

const CustomPopper = props => <Popper {...props} placement="bottom-start" sx={{
  '.MuiAutocomplete-noOptions, .MuiAutocomplete-loading, .MuiAutocomplete-listbox': {
    p: 0,
  },
  '.MuiTabs-root': {
    minHeight: '36px',
  },
  '.MuiTab-root': {
    py: 0.5,
    minHeight: '36px',
    fontSize: 12,
    textTransform: 'none',
  },
}} />;

const PopperContainer = styled(Stack)({
  minWidth: 280,
});

const renderUser = (props: React.HTMLAttributes<HTMLLIElement>, option: Option) => {
  return (
    <ListItem {...props}>
      <ListItemAvatar>
        <Avatar src={`https://github.com/${(option as UserInfo).login}.png`} />
      </ListItemAvatar>
      <ListItemText>
        {(option as UserInfo).login}
      </ListItemText>
    </ListItem>
  );
};

const renderRepo = (props: React.HTMLAttributes<HTMLLIElement>, option: Option) => {
  return (
    <ListItem {...props}>
      <ListItemAvatar>
        <Avatar src={`https://github.com/${(option as SearchRepoInfo).fullName.split('/')[0]}.png`} />
      </ListItemAvatar>
      <ListItemText>
        {(option as SearchRepoInfo).fullName}
      </ListItemText>
    </ListItem>
  );
};

const GeneralSearch = ({ contrast, align = 'left', size }: GeneralSearchProps) => {
  const [keyword, setKeyword] = useState('');
  const [type, tabs] = useTabs();
  const [option, setOption] = useState<Option>();
  const history = useHistory()

  const { data: list, error, loading } = useGeneralSearch(type, keyword);

  const handleOptionChange = useCallback((_: any, option: Option) => {
    setOption(option);
    switch (type) {
      case 'repo':
        history.push(`/analyze/${(option as SearchRepoInfo).fullName}`)
        break
      case 'user':
        history.push(`/analyze/${(option as UserInfo).login}`)
        break
    }
  }, [type]);

  const handleInputChange = useEventCallback((_: any, value: string) => {
    setKeyword(value);
  });

  return (
    <Autocomplete<Option, false, undefined, false>
      size={size === 'large' ? 'medium' : 'small'}
      loading={loading}
      options={list}
      isOptionEqualToValue={isOptionEqual}
      getOptionLabel={getOptionLabel}
      value={option}
      onChange={handleOptionChange}
      onInputChange={handleInputChange}
      sx={{
        maxWidth: size === 'large' ? 540 : 300,
        flex: 1,
      }}
      renderOption={type === 'repo' ? renderRepo : renderUser}
      renderInput={({ InputProps, ...params }) => (
        <TextField
          {...params}
          variant='outlined'
          placeholder='Enter a [Repo], [Developer]'
          sx={theme => ({
            backgroundColor: contrast ? '#E9EAEE' : '#3c3c3c',
            color: contrast ? theme.palette.getContrastText('#E9EAEE') : undefined,
            '.MuiAutocomplete-input': {
              textAlign: align,
            },
            '.MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            fontSize: size === 'large' ? 24 : undefined,
            py: size === 'large' ? '4px !important' : undefined,
          })}
          InputProps={{
            ...InputProps,
            sx: theme => ({
              backgroundColor: contrast ? '#E9EAEE' : '#3c3c3c',
              color: contrast ? theme.palette.getContrastText('#E9EAEE') : undefined,
            }),
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={theme => ({ color: contrast ? theme.palette.getContrastText('#E9EAEE') : undefined })} />
              </InputAdornment>
            ),
            endAdornment: loading ? (
              <InputAdornment position="end">
                <CircularProgress size='16px' sx={{ mr: 1 }} color={contrast ? 'info' : 'primary'} />
              </InputAdornment>
            ) : undefined,
        }}
        />
      )}
      noOptionsText={(
        <PopperContainer>
          {tabs}
          <Box p={2}>
            <Typography variant="body2">
              No {type}
            </Typography>
          </Box>
        </PopperContainer>
      )}
      loadingText={(
        <PopperContainer>
          {tabs}
          <Box p={2}>
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
          </Box>
        </PopperContainer>
      )}
      ListboxComponent={forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) => (
        <PopperContainer ref={ref} {...props}>
          {tabs}
          <List>
            {children}
          </List>
        </PopperContainer>
      ))}
      PopperComponent={CustomPopper}
    />
  );
};

export default GeneralSearch;
