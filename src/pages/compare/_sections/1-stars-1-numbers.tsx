import Section from "./common/section";
import React from "react";
import SomeNumbers, {SomeNumbersProps} from "./common/SomeNumbers";

const STAR_NUMBERS: SomeNumbersProps['queries'] = [
  {title: 'Stars total', query: "stars-total"},
  {title: 'Avg stars / week', query: "stars-average-by-week"},
  {title: 'Max stars / week', query: "stars-max-by-week"},
]

export default function () {
  return (
    <Section
      title={'title'}
      description={'desc'}
    >
      {({repo1, repo2}) => (
        <SomeNumbers title="Stars" repos={[repo1, repo2]} queries={STAR_NUMBERS} />
      )}
    </Section>
  )
}