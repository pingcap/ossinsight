import Link from '@docusaurus/Link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import React, { useCallback, useMemo, useState } from 'react';
import CompareHeader from '../../../../../components/CompareHeader/CompareHeader';
import { Repo } from '../../../../../components/CompareHeader/useSearchRepo';

export default function CompareTool () {
  const [repo1, setRepo1] = useState<Repo>(undefined)
  const [repo2, setRepo2] = useState<Repo>(undefined)
  const onRepo1Valid = useCallback((repo: Repo) => {
    if (repo?.name !== undefined && repo?.name === repo2?.name) {
      return 'Please select another repository to compare.'
    }
  }, [repo2])
  const onRepo2Valid = useCallback((repo: Repo) => {
    if (repo?.name !== undefined && repo?.name === repo1?.name) {
      return 'Please select another repository to compare.'
    }
  }, [repo1])
  const compare = useMemo(() => {
    if (!repo1 || !repo2) {
      return undefined
    }
    return `/analyze/${repo1.name}?vs=${encodeURIComponent(repo2.name)}`
  }, [repo1, repo2])

  return (
    <Box sx={theme => ({
      mt: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        '> *': {
          width: '100%'
        }
      }
    })}>
      <CompareHeader
        repo1={repo1}
        repo2={repo2}
        onRepo1Change={setRepo1}
        onRepo2Change={setRepo2}
        onRepo1Valid={onRepo1Valid}
        onRepo2Valid={onRepo2Valid}
        sx={{backgroundColor: 'transparent', flex: 1, borderBottom: 'none'}}
        position='static'
      />
      <Button component={Link} variant='contained' href={compare} disabled={!repo1 || !repo2}>
        go!
      </Button>
    </Box>
  )
}