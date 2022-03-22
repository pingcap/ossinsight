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
      title='Stars'
      description='The chart below display the total number of stars, the average and the maximum number of stars per week gained by the two projects respectively since 2011. '
    >
      {({repo1, repo2}) => (
        <SomeNumbers repos={[repo1, repo2]} queries={STAR_NUMBERS} />
      )}
    </Section>
  )
}