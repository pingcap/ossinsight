import { useHistory } from '@docusaurus/router';
import SearchIcon from '@mui/icons-material/Search';
import { ListItem, ListItemAvatar, ListItemText, PopperProps, useEventCallback } from '@mui/material';
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
import React, {
  forwardRef,
  KeyboardEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SearchType, useGeneralSearch } from './useGeneralSearch';
import isHotkey from "is-hotkey";
import KeyboardUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

export interface GeneralSearchProps {
  contrast?: boolean;
  align?: 'left' | 'right' | 'center'
  size?: 'large'
  global?: boolean
}

type Option = SearchRepoInfo | UserInfo

const isOptionEqual = (a: Option, b: Option) => {
  return a.id === b.id;
};

const getOptionLabel = (option: Option) => (option as SearchRepoInfo).fullName || (option as UserInfo).login;

const useTabs = () => {
  const [type, setType] = useState<SearchType>('user');

  const handleTypeChange = useEventCallback((_: any, type: SearchType) => {
    setType(type);
  });

  const tabs = useMemo(() => {
    return (
      <Tabs value={type} onChange={handleTypeChange}>
        <Tab label="Developer" value="user" />
        <Tab label="Repo" value="repo" />
      </Tabs>
    );
  }, [type]);

  const next = useEventCallback(() => {
    setType(type => type === 'user' ? 'repo' : 'user')
  })

  return [type, tabs, next] as const;
};

const CustomPopper = ({ children, ...props }: PopperProps) => <Popper {...props} placement="bottom-start" sx={{
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
}} >
  {children}
</Popper>;

const PopperContainer = styled(Stack)(({ theme }) => ({
  minWidth: 280,
  maxHeight: '80vh !important',
  [theme.breakpoints.up('sm')]: {
    minWidth: 420,
  },
}));

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

const GeneralSearch = ({ contrast, align = 'left', size, global = false }: GeneralSearchProps) => {
  const [keyword, setKeyword] = useState('');
  const [type, tabs, next] = useTabs();
  const [option, setOption] = useState<Option>(null);
  const [open, setOpen] = useState(false)
  const history = useHistory()
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleOpen = useEventCallback(() => {
    setOpen(true)
  })

  const handleClose = useEventCallback(() => {
    setOpen(false)
  })

  const placeholder = useMemo(() => {
    if (!open) {
      return `Search a Developer, Repo`
    } else if (type === 'user') {
      return `Enter a Developer ID`
    } else {
      return `Enter a Repo ID`
    }
  }, [open, type])

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useEventCallback((e) => {
    if (isHotkey(['left', 'right', 'tab'], e)) {
      e.preventDefault();
      next();
    }
  });

  useEffect(() => {
    if (global) {
      const handleGlobalSearchShortcut = (e: KeyboardEvent) => {
        if (e.target !== document.body) {
          return;
        }
        if (isHotkey('/', e)) {
          inputRef?.current?.focus();
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }
      };
      document.body.addEventListener('keydown', handleGlobalSearchShortcut);
      return () => {
        document.body.removeEventListener('keydown', handleGlobalSearchShortcut);
      };
    }
  }, [global])

  return (
    <Autocomplete<Option, false, undefined, false>
      size={size === 'large' ? 'medium' : 'small'}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
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
          placeholder={placeholder}
          sx={theme => ({
            backgroundColor: contrast ? '#E9EAEE' : '#3c3c3c',
            borderRadius: 2,
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
          inputRef={inputRef}
          InputProps={{
            ...InputProps,
            onKeyDown: handleKeyDown,
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
            ) : (global && !open) ? <TipIcon icon='/' reverse display={[false, true]} />: undefined,
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
        <PopperContainer ref={ref} {...props} sx={{ paddingBottom: '32px !important' }}>
          {tabs}
          <List>
            {children}
          </List>
          <Box position='absolute' bottom={0} width='100%' left={0} height={32} p={0.5} bgcolor='#121212' display={['none', 'block']}>
            <Stack direction='row'>
              <TipGroup text='To Navigate'>
                <Stack direction='row'>
                  <TipIcon icon='TAB' />
                  <TipIcon icon={<KeyboardUpIcon fontSize='inherit'/>} />
                  <TipIcon icon={<KeyboardDownIcon fontSize='inherit'/>} />
                </Stack>
              </TipGroup>
              <TipGroup text='To Cancel'>
                <TipIcon icon='ESC' />
              </TipGroup>
              <TipGroup text='To Enter'>
                <TipIcon icon={<KeyboardReturnIcon fontSize='inherit'/>} />
              </TipGroup>
            </Stack>
          </Box>
        </PopperContainer>
      ))}
      PopperComponent={CustomPopper}
    />
  );
};

const TipGroup = ({ children, text }: { text: string, children: JSX.Element }) => (
  <Stack direction='row' mr={1}>
    {children}
    <Typography variant='body2' ml={0.5} lineHeight='24px'>
      {text}
    </Typography>
  </Stack>
)

const TipIcon = ({ icon, reverse = false, display }: { icon: ReactNode, reverse?: boolean, display?: boolean[] }) => (
  <Box bgcolor={reverse ? '#8c8c8c' : '#3c3c3c'} borderRadius={1} fontSize={typeof icon === 'string' ? 12 : 16} minWidth={24} height={24} mr={0.5} px={typeof icon === 'string' ? 1 : 0} display={display ? display.map(b => b ? 'flex' : 'none') : 'flex'} alignItems='center' justifyContent='center'>
    {icon}
  </Box>
)

export default GeneralSearch;
