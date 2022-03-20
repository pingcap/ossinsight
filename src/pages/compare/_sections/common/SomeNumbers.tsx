import CompareNumbers, {CompareNumbersContainer} from "../../../../components/RemoteCards/CompareNumbers";
import React from "react";
import {Repo} from "../../../../components/CompareHeader/RepoSelector";

export interface SomeNumbersProps {
  repos: [Repo | null, Repo | null]
  queries: { title: string, query: string }[]
}


const SomeNumbers = ({ repos, queries}: SomeNumbersProps) => {
  return (
    <CompareNumbersContainer>
      {queries.map(({title, query}) => (
        <CompareNumbers key={query} title={title} query={query} repos={repos} />
      ))}
    </CompareNumbersContainer>
  )
}

export default SomeNumbers