import Section from "./common/section";
import React from "react";
import SomeNumbers, {SomeNumbersProps} from "./common/SomeNumbers";

const COMMIT_NUMBERS: SomeNumbersProps['queries'] = [
  {title: 'Commits', query: "commits-total"},
  {title: 'Committers', query: 'committers-total'},
  {title: 'Pushes', query: 'pushes-total'},
]

export default function () {
  return (
    <Section
      title={'title'}
      description={'desc'}
    >
      {({repo1, repo2}) => (
        <SomeNumbers title="Commit" repos={[repo1, repo2]} queries={COMMIT_NUMBERS} />
      )}
    </Section>
  )
}