import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { AxiosError } from 'axios';
import React, { useMemo } from 'react';
import { ReactNode } from 'react';
import { AsyncData, RemoteData } from '../../../components/RemoteCharts/hook';

export function withRemote<T>({ data, loading, error }: AsyncData<RemoteData<any, T>>, render: (data: RemoteData<any, T>) => ReactNode, fallback?: () => ReactNode) {
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
    return render(data)
  } else if (fallback) {
    return fallback()
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