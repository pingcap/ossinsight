import Section from "./common/section";
import React from "react";
import SomeNumbers, {SomeNumbersProps} from "./common/SomeNumbers";

const ISSUE_NUMBERS: SomeNumbersProps['queries'] = [
  {title: 'Total issues', query: "issues-total"},
  {title: 'Total issue creators', query: 'issue-creators-total'},
  {title: 'Total issue comments', query: 'issue-comments-total'},
  {title: 'Total issue commenters', query: 'issue-commenters-total'},
]

export default function () {
  return (
    <Section
      title='Issues'
      description='The chart below displays the total number of issues, issue submitters, issues comments, and issue commenters gained by each project respectively.'
    >
      {({repo1, repo2}) => (
        <SomeNumbers repos={[repo1, repo2]} queries={ISSUE_NUMBERS} />
      )}
    </Section>
  )
}