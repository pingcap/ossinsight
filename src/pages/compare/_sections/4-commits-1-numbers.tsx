import Section from "./common/section";
import React from "react";
import SomeNumbers, {SomeNumbersProps} from "./common/SomeNumbers";

const COMMIT_NUMBERS: SomeNumbersProps['queries'] = [
  {title: 'Total commits', query: "commits-total"},
  {title: 'Total committers', query: 'committers-total'},
  {title: 'Total pushes', query: 'pushes-total'},
]

export default function () {
  return (
    <Section
      title='Commits'
      description='The chart below displays the total number of commits, committers, and push events gained by each project.'
    >
      {({repo1, repo2}) => (
        <SomeNumbers repos={[repo1, repo2]} queries={COMMIT_NUMBERS} />
      )}
    </Section>
  )
}