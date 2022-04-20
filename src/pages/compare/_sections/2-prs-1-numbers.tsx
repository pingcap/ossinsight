import Section from "./common/section";
import React from "react";
import SomeNumbers, {SomeNumbersProps} from "./common/SomeNumbers";

const PULL_REQUEST_NUMBERS: SomeNumbersProps['queries'] = [
  {title: 'Total PRs', query: "pull-requests-total"},
  {title: 'Total PR creators', query: "pull-request-creators-total"},
  {title: 'Total PR reviews', query: "pull-request-reviews-total"},
  {title: 'Total PR reviewers', query: "pull-request-reviewers-total"},
]

export default function () {
  return (
    <Section
      title='PRs'
      description='The chart below displays the total number of PRs, PR creators, PR reviews, and PR reviewers gained by the two projects respectively.'
    >
      {({repo1, repo2}) => (
        <SomeNumbers repos={[repo1, repo2]} queries={PULL_REQUEST_NUMBERS} />
      )}
    </Section>
  )
}