import { useHistory } from '@docusaurus/router';
import React, { useCallback } from 'react';
import RepoSelector, { Repo } from '../CompareHeader/RepoSelector';

export interface AnalyzeSelectorProps {
  placeholder?: string
  align?: 'left' | 'right'
  contrast?: boolean
  size?: 'large'
}

export default function AnalyzeSelector ({placeholder = 'Quick insights on any repo', align, size, contrast}: AnalyzeSelectorProps) {
  const history = useHistory()
  const onAnalyzeRepoChanged = useCallback((repo: Repo | undefined) => {
    if (repo) {
      history.push(`/analyze/${repo.name}`)
    }
  }, [])
  const onAnalyzeRepoValid = useCallback(() => {
    return undefined
  }, [])

  return (
    <RepoSelector
      defaultRepoName='recommend-repo-list-1-keyword'
      label={placeholder}
      repo={undefined}
      onChange={onAnalyzeRepoChanged}
      onValid={onAnalyzeRepoValid}
      align={align}
      size={size}
      contrast={contrast}
    />
  )
}