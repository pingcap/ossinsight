import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import {useCallback, useEffect, useState} from "react";
import {getRandomColor} from "../../lib/color";
import {Alert, debounce, Snackbar} from "@mui/material";
import {createHttpClient} from "../../lib/request";

const httpClient = createHttpClient();

export default function RepoSelector(props) {
  const { label, defaultRepoName } = props;
  const [repo, setRepo] = useState<{}>();
  const [options, setOptions] = useState([]);
  const [errorMessage, setErrorMessage] = useState("error")
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [loading, setLoading] = useState(false);

  const fetchRepoOptions = useCallback(debounce(async (keyword) => {
    if (keyword === undefined || keyword.length === 0) {
      return
    }

    try {
      setLoading(true);
      const { data: resData } = await httpClient.get(`/gh/repos/search?keyword=${keyword}`)
      const repoOptions = resData.data.map((r) => ({
        name: r.fullName,
        color: getRandomColor(),
      }));
      setOptions(repoOptions);
    } catch (err) {
      const errMsg = err?.response?.data?.message || "";
      console.dir(err)
      if (errMsg.indexOf('API rate limit exceeded') !== -1) {
        setErrorMessage('Too frequent to operate, please try again after one minute.')
        setShowErrorMessage(true)
      } else {
        console.error('Failed to fetch repo options, cause by: ', err);
      }
    } finally {
      setLoading(false);
    }
  }, 500), []);

  useEffect(() => {
    (async () => {
      await fetchRepoOptions(defaultRepoName);
    })();
  }, []);

  return (<>
    <Autocomplete
      sx={{ width: 300 }}
      size="small"
      isOptionEqualToValue={(option, value) => option.name === value.name}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      value={repo}
      onChange={(event, newValue) => {
        setRepo(newValue);
        props.onChange(newValue);
      }}
      onInputChange={async (event, value, reason) => {
        await fetchRepoOptions(value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
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
    <Snackbar open={showErrorMessage} autoHideDuration={3000} onClose={() => { setShowErrorMessage(false); }}>
      <Alert severity="error" sx={{width: '100%'}}>{ errorMessage }</Alert>
    </Snackbar>
  </>);
}
