import * as React from 'react';
import {useMemo, useState} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import {getRandomColor} from "../../lib/color";
import {Alert, debounce, Snackbar} from "@mui/material";
import {createHttpClient} from "../../lib/request";
import useSWR from "swr";

const httpClient = createHttpClient();

export interface Repo extends Record<string, unknown> {
  name: string
  color: string
}

export interface RepoSelectorProps {
  label: string
  defaultRepoName?: string
  repo: Repo | null
  onChange: (repo: Repo | null) => void
}

export default function RepoSelector({repo, label, defaultRepoName, onChange}: RepoSelectorProps) {
  const [keyword, setKeyword] = useState<string>(defaultRepoName ?? '')
  const [dismissError, setDismissError] = useState(false)

  const debouncedSetKeyword = useMemo(() => {
    return debounce(setKeyword, 500)
  }, [setKeyword])

  const {data: options, isValidating: loading, error} = useSWR<Repo[]>([keyword || defaultRepoName], {
    fetcher: async (keyword) => {
      try {
        if (!keyword) {
          return []
        }
        const {data: {data}} = await httpClient.get(`/gh/repos/search`, {params: {keyword}})
        return data.map((r) => ({
          name: r.fullName,
          color: getRandomColor(),
        }));
      } finally {
        setDismissError(false)
      }
    },
    fallbackData: [],
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const errorMessage = useMemo(() => {
    const errMsg = error?.response?.data?.message || String(error);
    if (errMsg.indexOf('API rate limit exceeded') !== -1) {
      return 'Too frequent to operate, please try again after one minute.'
    }
    return errMsg
  }, [error])

  return (<>
    <Autocomplete<Repo>
      sx={{maxWidth: 300, mx: 'auto'}}
      size="small"
      isOptionEqualToValue={(option, value) => option.name === value.name}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      value={repo}
      onChange={(event, newValue: Repo) => {
        onChange(newValue);
      }}
      onInputChange={async (event, value, reason) => {
        debouncedSetKeyword(value)
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label={label}
          InputProps={{
            ...params.InputProps,
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
