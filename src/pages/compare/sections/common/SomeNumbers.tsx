import CompareNumbers, {CompareNumbersContainer} from "../../../../components/RemoteCards/CompareNumbers";
import React from "react";
import {Repo} from "../../../../components/CompareHeader/RepoSelector";

export interface SomeNumbersProps {
  title: string
  repos: [Repo | null, Repo | null]
  queries: { title: string, query: string }[]
}


const SomeNumbers = ({title, repos, queries}: SomeNumbersProps) => {
  return (
    <CompareNumbersContainer title={title}>
      {queries.map(({title, query}) => (
        <CompareNumbers key={query} title={title} query={query} repos={repos} />
      ))}
    </CompareNumbersContainer>
  )
}

export default SomeNumbers