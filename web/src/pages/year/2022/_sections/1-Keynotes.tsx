import Section from "@site/src/pages/year/2022/_components/Section";
import React, { ReactNode } from "react";
import { IssueOpenedIcon, RepoForkedIcon, StarIcon } from "@primer/octicons-react";
import Keynote, { KeynoteProps } from "@site/src/pages/year/2022/_components/Keynote";
import colors from '../_components/colors.module.css'
import Split from "@site/src/pages/year/2022/_components/Split";

export default function () {
  return (
    <Section>
      <Split>
        {keynotes.map((keynote, i) => (
          <Keynote key={i} {...keynote} />
        ))}
      </Split>
    </Section>
  );
}



const keynotes: KeynoteProps[] = [
  {
    icon: <IssueOpenedIcon size={24} className={colors.blue} />,
    title: 'About GitHub events',
    description: 'GitHub events are triggered by user actions, like starring a repository or pushing code.',
  },
  {
    icon: <RepoForkedIcon size={24} className={colors.orange} />,
    title: 'About time range',
    description: ' In this report, the time range of 2022 is from January 1, 2022 to September 30, 2022. When comparing data of 2022 with another year, we use year-on-year analysis.',
  },
  {
    icon: <StarIcon size={24} className={colors.green} />,
    title: 'About bot events',
    description: 'Bot-triggered events account for a growing percentage of GitHub events. However, these events are not the focus of this report. We filtered out most of the bot-initiated events by matching regular expressions.',
  },
];
