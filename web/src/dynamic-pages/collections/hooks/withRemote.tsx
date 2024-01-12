import CodeIcon from '@mui/icons-material/Code';
import { LoadingButton } from '@mui/lab';
import React, { ReactNode, useMemo } from 'react';
import { AsyncData, RemoteData } from '../../../components/RemoteCharts/hook';
import { useDebugDialog } from '../../../components/DebugDialog';
import { notNullish } from '@site/src/utils/value';
import { getErrorMessage } from '@site/src/utils/error';

import { Alert, Box, Skeleton } from '@mui/material';

export function withRemote<T> ({ data, loading, error }: AsyncData<RemoteData<any, T>>, render: (data: RemoteData<any, T>) => ReactNode, fallback?: () => ReactNode) {
  const { dialog: debugDialog, button: debugButton } = useDebugDialog(data);

  const errorMessage = useMemo(() => {
    const errMsg = getErrorMessage(error);
    if (errMsg.includes('API rate limit exceeded')) {
      return 'Too frequent to operate, please try again after one minute.';
    }
    return errMsg;
  }, [error]);

  if (notNullish(error)) {
    return (
      <Alert severity="error">{errorMessage}</Alert>
    );
  } else if (notNullish(data)) {
    return (
      <>
        <Box display="flex" justifyContent="flex-end">
          {debugButton}
        </Box>
        {render(data)}
        {debugDialog}
      </>
    );
  } else if (notNullish(fallback)) {
    return (
      <>
        <Box display="flex" justifyContent="flex-end">
          <LoadingButton loading size="small" endIcon={<CodeIcon />}>SHOW SQL</LoadingButton>
        </Box>
        {fallback()}
      </>
    );
  } else {
    return (
      <Box>
        <Skeleton variant="text" width="70%" sx={{ mt: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
        <Skeleton variant="text" width="90%" sx={{ my: 1 }} />
      </Box>
    );
  }
}
