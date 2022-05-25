import CodeIcon from '@mui/icons-material/Code';
import { LoadingButton } from '@mui/lab';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { AxiosError } from 'axios';
import React, { useCallback, useMemo, useState } from 'react';
import { ReactNode } from 'react';
import DebugDialog from '../../../components/DebugDialog/DebugDialog';
import { AsyncData, RemoteData } from '../../../components/RemoteCharts/hook';

export function withRemote<T>({ data, loading, error }: AsyncData<RemoteData<any, T>>, render: (data: RemoteData<any, T>) => ReactNode, fallback?: () => ReactNode) {
  const [showDebugModel, setShowDebugModel] = useState(false);

  const handleShowDebugModel = useCallback(() => {
    setShowDebugModel(true);
  }, [])

  const handleCloseDebugModel = useCallback(() => {
    setShowDebugModel(false);
  }, [])

  const errorMessage = useMemo(() => {
    if (!error) {
      return undefined
    }
    const errMsg = (error as AxiosError)?.response?.data?.message || String(error || '');
    if (errMsg.indexOf('API rate limit exceeded') !== -1) {
      return 'Too frequent to operate, please try again after one minute.'
    }
    return errMsg
  }, [error])

  if (error) {
    return (
      <Alert severity='error'>{errorMessage}</Alert>
    )
  } else if (data) {
    return (
      <>
        <Box display='flex' justifyContent='flex-end'>
          <Button size='small' onClick={handleShowDebugModel} endIcon={<CodeIcon />}>REQUEST INFO</Button>
        </Box>
        {render(data)}
        <DebugDialog sql={data.sql} query={data.query} params={data.params} open={showDebugModel} onClose={handleCloseDebugModel} />
      </>
    )
  } else if (fallback) {
    return (
      <>
        <Box display='flex' justifyContent='flex-end'>
          <LoadingButton loading size='small' endIcon={<CodeIcon />}>REQUEST INFO</LoadingButton>
        </Box>
        {fallback()}
      </>
    )
  } else {
    return (
      <Box>
        <Skeleton variant='text' width='70%' sx={{mt: 1 }} />
        <Skeleton variant='text' width='60%' sx={{mt: 1 }} />
        <Skeleton variant='text' width='90%' sx={{my: 1 }} />
      </Box>
    )
  }
}