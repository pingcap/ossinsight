import Section from "./common/section";
import React from "react";
import SomeNumbers, {SomeNumbersProps} from "./common/SomeNumbers";

const PULL_REQUEST_NUMBERS: SomeNumbersProps['queries'] = [
  {title: 'Pull requests', query: "pull-requests-total"},
  {title: 'PR creators', query: "pull-request-creators-total"},
  {title: 'Pull request reviews', query: "pull-request-reviews-total"},
  {title: 'Pull request reviewers', query: "pull-request-reviewers-total"},
]

export default function () {
  return (
    <Section
      title={'title'}
      description={'desc'}
    >
      {({repo1, repo2}) => (
        <SomeNumbers title="Pull Request" repos={[repo1, repo2]} queries={PULL_REQUEST_NUMBERS} />
      )}
    </Section>
  )
}