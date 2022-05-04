import { AxiosError } from 'axios';
import * as React from 'react';
import {useCallback, useMemo, useState} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import {Alert, Snackbar} from "@mui/material";
import {UseAutocompleteProps} from "@mui/base/AutocompleteUnstyled/useAutocomplete";
import { useSearchRepo, Repo } from './useSearchRepo';

export { Repo } from './useSearchRepo'


export interface RepoSelectorProps {
  label: string
  defaultRepoName?: string
  repo: Repo | null
  onChange?: (repo: Repo | null) => void
  onValid?: (repo: Repo | null) => string | undefined
  disableClearable?: boolean
  align?: 'left' | 'right'
  contrast?: boolean
}

const noValidation = () => undefined

export default function RepoSelector({repo, label, defaultRepoName, onChange, onValid = noValidation, disableClearable, align = 'left', contrast}: RepoSelectorProps) {
  const [keyword, setKeyword] = useState<string>(defaultRepoName ?? '')
  const [textFieldError, setTextFieldError] = useState<boolean>(false)
  const [helperText, setHelperText] = useState<string>('')
  const [dismissError, setDismissError] = useState(false)

  const { data: options, loading, error } = useSearchRepo(keyword)

  const onAutoCompleteChange = useCallback((event, newValue: Repo) => {
    const validMessage = onValid(newValue);

    if (validMessage !== undefined) {
      setTextFieldError(true);
      setHelperText(validMessage);
    } else {
      onChange?.(newValue);
    }
  }, [onValid, onChange])

  const onInputChange: UseAutocompleteProps<any, any, any, any>['onInputChange'] = useCallback(async (event, value, reason) => {
    setHelperText(undefined);
    setTextFieldError(false);
    setKeyword(value)
  }, [])

  const errorMessage = useMemo(() => {
    const errMsg = (error as AxiosError)?.response?.data?.message || String(error || '');
    if (errMsg.indexOf('API rate limit exceeded') !== -1) {
      return 'Too frequent to operate, please try again after one minute.'
    }
    return errMsg
  }, [error])

  return (<>
    <Autocomplete<Repo>
      sx={theme => ({
        maxWidth: 300,
        flex: 1,
        '.MuiAutocomplete-popupIndicator': {
          color: contrast ? theme.palette.getContrastText('#E9EAEE') : undefined,
        }
      })}
      size="small"
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      getOptionLabel={(option) => option.name}
      options={options ?? []}
      loading={loading}
      value={repo ?? null}
      onChange={onAutoCompleteChange}
      onInputChange={onInputChange}
      disableClearable={disableClearable as any}
      renderInput={(params) => (
        <TextField
          {...params}
          error={textFieldError}
          variant="outlined"
          size='small'
          placeholder={label}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            sx: theme => ({
              backgroundColor: contrast ? '#E9EAEE' : '#2c2c2c',
              color: contrast ? theme.palette.getContrastText('#E9EAEE') : undefined,
              pr: `${theme.spacing(4)} !important`,
              '.MuiAutocomplete-input': {
                textAlign: align,
              },
              '.MuiOutlinedInput-notchedOutline': {
                border: 'none',
              }
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
    <Snackbar open={!!error && !dismissError} autoHideDuration={3000} onClose={() => setDismissError(true)}>
      <Alert severity="error" sx={{width: '100%'}}>{errorMessage}</Alert>
    </Snackbar>
  </>);
}
