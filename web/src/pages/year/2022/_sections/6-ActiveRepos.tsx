import React, { ReactElement } from "react";
import Section from "../_components/Section";
import { H2, P2 } from "../_components/typograph";
import { A, BR, LI, ResponsiveColumnFlex, Spacer, UL } from "../_components/styled";
import Split from "../_components/Split";
import Insights from "../_components/Insights";
import { styled } from "@mui/material/styles";
import colors from '../_components/colors.module.css';
import _MSIcon from '../_icons/ms.svg';

export default function () {
  return (
    <Section
      title={title}
      description={description}
    >
      <Split mt={6}>
        <RepoRanks list={list} />
        <ResponsiveColumnFlex height='100%'>
          {insights.map((insight, i) => (
            insight ? <Insights key={i} hideTitle={i > 0}>{insight}</Insights> : <Spacer key={i} />
          ))}
        </ResponsiveColumnFlex>
      </Split>
    </Section>
  );
}

type Rank = {
  repo: string
  count: number
  icon?: ReactElement
}

const MSIcon = styled(_MSIcon)({
  display: 'inline-flex',
  verticalAlign: -7
})
const title = 'The Most Active Repos over the 4 years';
const description = 'Here we look up the top 20 active projects per year from 2019 to 2022 and count the total number of listing in the ranking.';
const list: Rank[] = [
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
    repo: 'microsoft/vscode',
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
  'NixOS/nixpkgs',
  'archway-network/testnets',
  'education/GitHubGraduation-2022',
  'element-fi/elf-council-frontend',
  'rust-lang/rust',
  'solana-labs/token-list',
  'taozhiyu/TyProAction',
];
const ghLink = (item, bold = true) => {
  const link = <A href={`https://github.com/${item}`} target="_blank" rel="noopener">{item}</A>;
  if (bold) {
    return <strong>{link}</strong>;
  } else {
    return link;
  }
};
const insights = [
  <>
    {ghLink('Microsoft')} is the organization with the most projects on the list, with 4 projects having been on
    the list.
  </>,
  <>
    {ghLink('tensorflow/tensorflow')} and {ghLink('kubernetes/kubernetes')} both dropped out of the Top 20
    after 3 consecutive years on the list
    from 2019-2021.
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
  fontFamily: 'JetBrains Mono',
  fontSize: 16,
  border: 'none',
  display: 'table',
  width: '100%',
  maxWidth: 547,
  'thead, tbody, tr, td, th': {
    border: 'none',
    background: 'none !important',
  },
  'thead, tbody': {
    width: '100%',
  },
  'td, th': {
    padding: '16px 0'
  }
});

const Dot = styled('span')({
  display: 'inline-block',
  backgroundColor: 'currentcolor',
  width: 12,
  height: 12,
  borderRadius: '50%',
  marginRight: 8,
});

