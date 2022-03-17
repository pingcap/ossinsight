import Section from "./common/section";
import React from "react";
import SomeNumbers, {SomeNumbersProps} from "./common/SomeNumbers";

const ISSUE_NUMBERS: SomeNumbersProps['queries'] = [
  {title: 'Issues', query: "issues-total"},
  {title: 'Issue creators', query: 'issue-creators-total'},
  {title: 'Issue comments', query: 'issue-comments-total'},
  {title: 'Issue commenters', query: 'issue-commenters-total'},
]

export default function () {
  return (
    <Section
      title={'title'}
      description={'desc'}
    >
      {({repo1, repo2}) => (
        <SomeNumbers title="Issue" repos={[repo1, repo2]} queries={ISSUE_NUMBERS} />
      )}
    </Section>
  )
}