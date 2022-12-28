import { useHistory } from '@docusaurus/router';
import SearchIcon from '@mui/icons-material/Search';
import {
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemProps,
  ListItemText,
  PopperProps,
  useEventCallback,
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  InputAdornment,
  List,
  Popper,
  Skeleton,
  Stack,
  styled,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { SearchRepoInfo, UserInfo } from '@ossinsight/api';
import React, {
  FC, ForwardedRef,
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
import isHotkey from 'is-hotkey';
import KeyboardUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { AutocompleteHighlightChangeReason } from '@mui/base/AutocompleteUnstyled/useAutocomplete';
import { notNullish } from '@site/src/utils/value';

export interface GeneralSearchProps {
  contrast?: boolean;
  align?: 'left' | 'right' | 'center';
  size?: 'large';
  global?: boolean;
}

type Option = SearchRepoInfo | UserInfo;

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
    setType(type => type === 'user' ? 'repo' : 'user');
  });

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
  [theme.breakpoints.up('sm')]: {
    minWidth: 420,
    maxHeight: '80vh !important',
  },
  [theme.breakpoints.up('md')]: {
    minWidth: 280,
    maxHeight: '80vh !important',
  },
}));

const AvatarContainer = styled('div')({
  width: 24,
  height: 24,
  background: 'lightgrey',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
});

export const renderUser = (props: React.HTMLAttributes<HTMLLIElement>, option: Option, highlight: boolean) => {
  return (
    <ListItem dense {...props}>
      <ListItemAvatar sx={{ minWidth: 32 }}>
        <AvatarContainer>
          <Avatar src={`https://github.com/${(option as UserInfo).login}.png`} sx={{ width: 24, height: 24 }} />
        </AvatarContainer>
      </ListItemAvatar>
      <ListItemText>
        {(option as UserInfo).login}
      </ListItemText>
      {highlight
        ? (
          <ListItemIcon>
            <TipIcon reverse textContent icon={<><KeyboardReturnIcon fontSize='inherit'/> Enter</>} />
          </ListItemIcon>
          )
        : undefined}
    </ListItem>
  );
};

export const renderRepo = (props: ListItemProps, option: Option, highlight: boolean) => {
  return (
    <ListItem dense {...props}>
      <ListItemAvatar sx={{ minWidth: 32 }}>
        <AvatarContainer>
          <Avatar src={`https://github.com/${(option as SearchRepoInfo).fullName.split('/')[0]}.png`} sx={{ width: 24, height: 24 }} />
        </AvatarContainer>
      </ListItemAvatar>
      <ListItemText>
        {(option as SearchRepoInfo).fullName}
      </ListItemText>
      {highlight
        ? (
          <ListItemIcon>
            <TipIcon reverse textContent icon={<><KeyboardReturnIcon fontSize='inherit'/> Enter</>} />
          </ListItemIcon>
          )
        : undefined}
    </ListItem>
  );
};

const GeneralSearch: FC<GeneralSearchProps> = ({ contrast, align = 'left', size, global = false }: GeneralSearchProps) => {
  const [keyword, setKeyword] = useState('');
  const [type, tabs, next] = useTabs();
  const [option, setOption] = useState<Option | null>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<Option | null>(null);
  const history = useHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: list, loading } = useGeneralSearch(type, keyword);

  const handleOptionChange = useCallback((_: any, option: Option) => {
    setOption(option);
    setKeyword('');
    switch (type) {
      case 'repo':
        history.push(`/analyze/${(option as SearchRepoInfo).fullName}`);
        break;
      case 'user':
        history.push(`/analyze/${(option as UserInfo).login}`);
        break;
    }
  }, [type]);

  const handleInputChange = useEventCallback((_: any, value: string) => {
    setKeyword(value);
  });

  const handleOpen = useEventCallback(() => {
    setOpen(true);
  });

  const handleClose = useEventCallback(() => {
    setOpen(false);
    setKeyword('');
  });

  const placeholder = useMemo(() => {
    if (!open) {
      return 'Search a developer or repo';
    } else if (type === 'user') {
      return 'Enter a GitHub ID';
    } else {
      return 'Enter a GitHub Repo Name';
    }
  }, [open, type]);

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
  }, [global]);

  const handleHighlightChange = useEventCallback((event: React.SyntheticEvent, option: Option | null, reason: AutocompleteHighlightChangeReason) => {
    setTimeout(() => {
      setHighlight(option);
    }, 0);
  });

  return (
    <Autocomplete<Option, false, undefined, false>
      size={size === 'large' ? 'medium' : 'small'}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      loading={loading}
      options={list ?? []}
      isOptionEqualToValue={isOptionEqual}
      getOptionLabel={getOptionLabel}
      value={option}
      onChange={handleOptionChange}
      inputValue={keyword}
      onInputChange={handleInputChange}
      onHighlightChange={handleHighlightChange}
      forcePopupIcon={false}
      sx={useMemo(() => ({
        maxWidth: size === 'large' ? 540 : 300,
        flex: 1,
      }), [size])}
      renderOption={useCallback((props, option) => (
        type === 'repo'
          ? renderRepo(props, option, highlight === option)
          : renderUser(props, option, highlight === option)
      ), [type, highlight])}
      renderInput={useCallback(({ InputProps, ...params }) => (
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
            endAdornment: loading
              ? (
              <InputAdornment position="end">
                <CircularProgress size='16px' sx={{ mr: 1 }} color={contrast ? 'info' : 'primary'} />
              </InputAdornment>
                )
              : (global && !open && !option) ? <TipIcon icon='/' reverse display={[false, true]} /> : undefined,
          }}
        />
      ), [open, global, contrast, align, size, loading, option])}
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
      ListboxComponent={useCallback(forwardRef(function SearchList ({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLElement>) {
        return (
          <PopperContainer ref={ref} {...props}>
            {tabs}
            <List dense disablePadding>
              {children}
            </List>
            <Box height={32} p={0.5} bgcolor='#121212' display={['none', 'block']}>
              <Stack direction='row'>
                <TipGroup text='To Navigate'>
                  <Stack direction='row'>
                    <TipIcon textContent icon='TAB' />
                    <TipIcon icon={<KeyboardUpIcon fontSize='inherit'/>} />
                    <TipIcon icon={<KeyboardDownIcon fontSize='inherit'/>} />
                  </Stack>
                </TipGroup>
                <TipGroup text='To Cancel'>
                  <TipIcon textContent icon='ESC' />
                </TipGroup>
                <TipGroup text='To Enter'>
                  <TipIcon icon={<KeyboardReturnIcon fontSize='inherit'/>} />
                </TipGroup>
              </Stack>
            </Box>
          </PopperContainer>
        );
      }), [tabs])}
      PopperComponent={CustomPopper}
    />
  );
};

GeneralSearch.displayName = 'GeneralSearch';

const TipGroup = ({ children, text }: { text: string, children: JSX.Element }) => (
  <Stack direction='row' mr={1}>
    {children}
    <Typography variant='body2' ml={0.5} lineHeight='24px'>
      {text}
    </Typography>
  </Stack>
);

const TipIcon = ({ icon, textContent = false, reverse = false, display }: { icon: ReactNode, textContent?: boolean, reverse?: boolean, display?: boolean[] }) => (
  <Box
    bgcolor={reverse ? '#8c8c8c' : '#3c3c3c'}
    borderRadius={1}
    fontSize={textContent ? 12 : 16}
    minWidth={24}
    height={24}
    mr={0.5}
    px={textContent ? 1 : 0}
    display={notNullish(display) ? display.map(b => b ? 'flex' : 'none') : 'flex'}
    alignItems='center'
    justifyContent='center'
  >
    {icon}
  </Box>
);

export default GeneralSearch;
