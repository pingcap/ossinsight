import React, { ReactElement } from 'react';
import Section from '../_components/Section';
import { A, BR, Footnote, LI, ResponsiveColumnFlex, Spacer, UL } from '../_components/styled';
import Split from '../_components/Split';
import Insights from '../_components/Insights';
import colors from '../_components/colors.module.css';
import _MSIcon from '../_icons/ms.svg';
import { notNullish } from '@site/src/utils/value';
import { styled } from '@mui/material';

export default function () {
  return (
    <Section
      title={title}
      description={description}
    >
      <Split mt={[2, 4, 6]}>
        <div>
          <RepoRanks list={list} />
          <Footnote>{footnote}</Footnote>
        </div>
        <ResponsiveColumnFlex>
          {insights.map((insight, i) => (
            notNullish(insight) ? <Insights key={i} hideTitle={i > 0}>{insight}</Insights> : <Spacer key={i} />
          ))}
        </ResponsiveColumnFlex>
      </Split>
    </Section>
  );
}

type Rank = {
  repo: string;
  count: number;
  icon?: ReactElement;
};

const MSIcon = styled(_MSIcon)({
  display: 'inline-flex',
  verticalAlign: -7,
});
const title = 'The most active repositories over the past four years';
const description = 'Here we looked up the top 20 active repositories per year from 2019 to 2022 and counted the total number of listings per repository. The activity of the repository is ranked according to the number of developers participating in collaborative events.';
const footnote = '* Time range: 2022.01.01-2022.09.30, excluding bot events';
const list: Rank[] = [
  {
    repo: 'microsoft/vscode',
    count: 4,
    icon: <MSIcon />,
  },
  {
    repo: 'flutter/flutter',
    count: 4,
  },
  {
    repo: 'MicrosoftDocs/azure-docs',
    count: 4,
    icon: <MSIcon />,
  },
  {
    repo: 'firstcontributions/first-contributions',
    count: 4,
  },
  {
    repo: 'Facebook/react-native',
    count: 4,
  },
  {
    repo: 'pytorch/pytorch',
    count: 4,
  },
  {
    repo: 'microsoft/TypeScript',
    count: 4,
    icon: <MSIcon />,
  },
  {
    repo: 'tensorflow/tensorflow',
    count: 3,
  },
  {
    repo: 'kubernetes/kubernetes',
    count: 3,
  },
  {
    repo: 'DefinitelyTyped/DefinitelyTyped',
    count: 3,
  },
  {
    repo: 'golang/go',
    count: 3,
  },
  {
    repo: 'google/it-cert-automation-practice',
    count: 3,
  },
  {
    repo: 'home-assistant/core',
    count: 3,
  },
  {
    repo: 'microsoft/PowerToys',
    count: 3,
    icon: <MSIcon />,
  },
  {
    repo: 'microsoft/WSL',
    count: 3,
    icon: <MSIcon />,
  },
];

const list2022: string[] = [
  'archway-network/testnets',
  'element-fi/elf-council-frontend',
  'solana-labs/token-list',
  'education/GitHubGraduation-2022',
  'taozhiyu/TyProAction',
  'NixOS/nixpkgs',
  'rust-lang/rust',
];
const ghLink = (item: string, bold = true) => {
  const link = <A href={`https://ossinsight.io/analyze/${item}`} target="_blank" rel="noopener">{item}</A>;
  if (bold) {
    return <strong>{link}</strong>;
  } else {
    return link;
  }
};
const insights = [
  <>
    {ghLink('Microsoft')} has the most repositories on the list, with five.
  </>,
  <>
    {ghLink('tensorflow/tensorflow')} and {ghLink('kubernetes/kubernetes')} both dropped out of the top 20 after three
    consecutive years on the list (2019 to 2021).
  </>,
  undefined,
  <>
    New to the list 2022:
    <BR />
    <UL>
      {list2022.map(item => (
        <LI key={item}>
          {ghLink(item)}
        </LI>
      ))}
    </UL>
  </>,
];

const RepoRanks = ({ list }: { list: Rank[] }) => {
  return (
    <Table width="100%">
      <colgroup style={{ width: '100%' }}>
        <col style={{ width: '80%' }} />
        <col style={{ width: '20%', textAlign: 'right' }} />
      </colgroup>
      <thead>
      <tr>
        <th align="left">Repository Name</th>
        <th align="right">Count</th>
      </tr>
      </thead>
      <tbody>
      {list.map((rank, i) => (
        <tr key={i} className={rank.count > 3 ? colors.orange : colors.green}>
          <td>
            {ghLink(rank.repo, false)}
            {rank.icon}
          </td>
          <td align="right">
            <Dot />
            {rank.count}
          </td>
        </tr>
      ))}
      </tbody>
    </Table>
  );
};

const Table = styled('table')({
  fontSize: '0.8em',
  border: 'none',
  display: 'table',
  width: '100%',
  maxWidth: 547,
  margin: 0,
  'thead, tbody, tr, td, th': {
    border: 'none',
    background: 'none !important',
  },
  'thead, tbody': {
    width: '100%',
  },
  'td, th': {
    padding: '8px 0',
  },
});

const Dot = styled('span')({
  display: 'inline-block',
  backgroundColor: 'currentcolor',
  width: 12,
  height: 12,
  borderRadius: '50%',
  marginRight: 8,
});
