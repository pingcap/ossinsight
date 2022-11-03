import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Popper,
  Snackbar,
  Stack,
  styled,
  TextField,
  InputBase,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { UseAutocompleteProps } from '@mui/base/AutocompleteUnstyled/useAutocomplete';
import { Repo, useSearchRepo } from './useSearchRepo';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import './style.css';
import { getErrorMessage } from '@site/src/utils/error';
import { notNullish } from '@site/src/utils/value';

export type { Repo } from './useSearchRepo';

export interface BaseRepoSelectorProps {
  defaultRepoName?: string;
  repo: Repo | null;
  onChange?: (repo: Repo | null) => void;
  onValid?: (repo: Repo | null) => string | undefined;
  disableClearable?: boolean;
}

export interface RepoSelectorProps extends BaseRepoSelectorProps {
  label: string;
  align?: 'left' | 'right';
  size?: 'large';
  contrast?: boolean;
}

const noValidation = () => undefined;

const CustomPopper = props => <Popper {...props} placement="bottom-start" />;

function useRepoSelector ({
  defaultRepoName,
  onChange,
  onValid = noValidation,
}: Pick<BaseRepoSelectorProps, 'defaultRepoName' | 'onChange' | 'onValid'>) {
  const [keyword, setKeyword] = useState<string>(defaultRepoName ?? '');
  const [textFieldError, setTextFieldError] = useState<boolean>(false);
  const [helperText, setHelperText] = useState<string>('');
  const [dismissError, setDismissError] = useState(false);

  const { data: options, loading, error } = useSearchRepo(((keyword || defaultRepoName)) ?? '');

  const onAutoCompleteChange = useCallback((event, newValue: Repo) => {
    const validMessage = onValid(newValue);

    if (notNullish(validMessage)) {
      setTextFieldError(true);
      setHelperText(validMessage);
    } else {
      onChange?.(newValue);
    }
  }, [onValid, onChange]);

  const onInputChange: UseAutocompleteProps<any, any, any, any>['onInputChange'] = useCallback((event, value) => {
    setHelperText('');
    setTextFieldError(false);
    setKeyword(value);
  }, []);

  const errorMessage = useMemo(() => {
    const errMsg = getErrorMessage(error);
    if (errMsg.includes('API rate limit exceeded')) {
      return 'Too frequent to operate, please try again after one minute.';
    }
    return errMsg;
  }, [error]);

  return {
    textFieldError,
    helperText,
    dismissError,
    setDismissError,
    options,
    loading,
    onAutoCompleteChange,
    onInputChange,
    errorMessage,
    error,
  };
}

export default function RepoSelector ({
  repo,
  size,
  label,
  defaultRepoName,
  onChange,
  onValid = noValidation,
  disableClearable,
  align = 'left',
  contrast,
}: RepoSelectorProps) {
  const {
    textFieldError,
    helperText,
    dismissError,
    setDismissError,
    options,
    loading,
    onAutoCompleteChange,
    onInputChange,
    errorMessage,
    error,
  } = useRepoSelector({ defaultRepoName, onChange, onValid });

  return (<>
    <Autocomplete<Repo>
      sx={theme => ({
        maxWidth: size === 'large' ? 540 : 300,
        flex: 1,
        '.MuiAutocomplete-popupIndicator, .MuiAutocomplete-clearIndicator': {
          color: contrast ? theme.palette.getContrastText('#E9EAEE') : undefined,
          verticalAlign: 'text-bottom',
        },
        '.MuiAutocomplete-clearIndicator': {
          visibility: 'visible !important',
        },
        '.MuiAutocomplete-popupIndicator': {
          transform: 'none !important',
        },
        '.MuiAutocomplete-endAdornment': {
          top: 'unset',
        },
      })}
      size={size === 'large' ? 'medium' : 'small'}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      getOptionLabel={(option: Repo) => option.name}
      options={options ?? []}
      loading={loading}
      value={repo ?? null}
      onChange={onAutoCompleteChange}
      onInputChange={onInputChange}
      disableClearable={disableClearable as any}
      popupIcon={<SearchIcon />}
      PopperComponent={CustomPopper}
      renderInput={(params) => (
        <TextField
          {...params}
          error={textFieldError}
          variant="outlined"
          size={size === 'large' ? 'medium' : 'small'}
          placeholder={label}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            sx: theme => ({
              backgroundColor: contrast ? '#E9EAEE' : '#3c3c3c',
              color: contrast ? theme.palette.getContrastText('#E9EAEE') : undefined,
              pr: `${theme.spacing(8)} !important`,
              '.MuiAutocomplete-input': {
                textAlign: align,
              },
              '.MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              fontSize: size === 'large' ? 24 : undefined,
              py: size === 'large' ? '4px !important' : undefined,
            }),
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
    <Snackbar open={notNullish(error) && !dismissError} autoHideDuration={3000} onClose={() => setDismissError(true)}>
      <Alert severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert>
    </Snackbar>
  </>);
}

const SearchContainer = styled('div')({
  position: 'relative',
  minWidth: 60,
  fontSize: 18,
  height: 40,
  padding: '0 8px',
});

const SearchLabel = styled('span')({
  display: 'block',
  overflow: 'visible',
  whiteSpace: 'nowrap',
  visibility: 'hidden',
  height: 40,
  lineHeight: '40px',
  maxWidth: 300,
});

export function FirstRepoSelector ({
  repo,
  defaultRepoName,
  onChange,
  onValid = noValidation,
  disableClearable,
}: BaseRepoSelectorProps) {
  const {
    textFieldError,
    dismissError,
    setDismissError,
    options,
    loading,
    onAutoCompleteChange,
    onInputChange,
    errorMessage,
    error,
  } = useRepoSelector({ defaultRepoName, onChange, onValid });

  return (<>
    <Autocomplete<Repo>
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      getOptionLabel={(option: Repo) => option.name}
      options={options ?? []}
      loading={loading}
      value={repo ?? null}
      onChange={onAutoCompleteChange}
      onInputChange={onInputChange}
      disableClearable={disableClearable as any}
      forcePopupIcon={false}
      renderInput={(params) => (
        <Stack direction="row" alignItems="center">
          <SearchIcon />
          <SearchContainer>
            <SearchLabel>{params.inputProps.value}</SearchLabel>
            <InputBase
              id={params.id}
              disabled={params.disabled}
              fullWidth={params.fullWidth}
              inputProps={params.inputProps}
              {...params.InputProps}
              inputMode="search"
              error={textFieldError}
              sx={{
                fontSize: 'inherit',
                position: 'absolute',
                left: 8,
                width: '100%',
                minWidth: 60,
                top: 0,
                p: 0,
                lineHeight: '36px',
                input: {
                  lineHeight: '36px',
                  height: 40,
                  py: '4px',
                  boxSizing: 'border-box',
                },
              }}
            />
          </SearchContainer>
        </Stack>

      )}
    />
    <Snackbar open={notNullish(error) && !dismissError} autoHideDuration={3000} onClose={() => setDismissError(true)}>
      <Alert severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert>
    </Snackbar>
  </>);
}

export function SecondRepoSelector ({
  placeholder,
  repo,
  defaultRepoName,
  onChange,
  onValid = noValidation,
  disableClearable,
}: BaseRepoSelectorProps & { placeholder: string }) {
  const {
    textFieldError,
    dismissError,
    setDismissError,
    options,
    loading,
    onAutoCompleteChange,
    onInputChange,
    errorMessage,
    error,
  } = useRepoSelector({ defaultRepoName, onChange, onValid });

  return (<>
    <Autocomplete<Repo>
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      getOptionLabel={(option: Repo) => option.name}
      options={options ?? []}
      loading={loading}
      value={repo ?? null}
      onChange={onAutoCompleteChange}
      onInputChange={onInputChange}
      disableClearable={disableClearable as any}
      forcePopupIcon={false}
      sx={{
        border: notNullish(repo) ? 'none' : '1px dashed rgba(255,255,255,0.5)',
        py: notNullish(repo) ? '2px' : undefined,
        boxSizing: 'border-box',
        borderRadius: '6px',
        '.MuiAutocomplete-endAdornment': {
          height: '100%',
          '> button': {
            position: 'absolute',
            top: 2,
            right: 8,
          },
        },
        '.MuiAutocomplete-clearIndicator': {
          visibility: 'visible',
        },
      }}
      renderInput={(params) => (
        <Stack direction="row" alignItems="center">
          {notNullish(repo) ? undefined : <AddIcon sx={{ color: 'rgba(255,255,255,0.5)', ml: 1, fontWeight: 'bold' }} />}
          <SearchContainer sx={{ height: '36px' }}>
            <SearchLabel sx={{ paddingRight: notNullish(repo) ? '38px' : undefined }}>
              {(params.inputProps.value as string) || placeholder}
            </SearchLabel>
            <InputBase
              id={params.id}
              disabled={params.disabled}
              fullWidth={params.fullWidth}
              inputProps={params.inputProps}
              placeholder={placeholder}
              {...params.InputProps}
              inputMode="search"
              error={textFieldError}
              sx={{
                fontSize: '18px',
                position: 'absolute',
                left: 8,
                width: 'calc(100%)',
                minWidth: 60,
                top: 0,
                p: 0,
                lineHeight: '36px',
                input: {
                  lineHeight: '36px',
                  height: 36,
                  py: '4px',
                  boxSizing: 'border-box',
                },
              }}
            />
          </SearchContainer>
        </Stack>

      )}
    />
    <Snackbar open={notNullish(error) && !dismissError} autoHideDuration={3000} onClose={() => setDismissError(true)}>
      <Alert severity="error" sx={{ width: '100%' }}>{errorMessage}</Alert>
    </Snackbar>
  </>);
}
