import {Repo} from "../../components/CompareHeader/RepoSelector";
import React, {useContext} from "react";

interface CompareContext {
  repo1: Repo | undefined
  repo2: Repo | undefined
  dateRange: [null, null]
  allProvidedRepos: (repos: (Repo | undefined)[]) => Repo[]
  allReposProvided: (repos: (Repo | undefined)[]) => boolean
}

const CompareContext = React.createContext<CompareContext>({
  repo1: undefined,
  repo2: undefined,
  dateRange: [null, null],
  allProvidedRepos: () => [],
  allReposProvided: () => false
})

export default CompareContext

export function useCompareContext(): CompareContext {
  return useContext(CompareContext)
}
