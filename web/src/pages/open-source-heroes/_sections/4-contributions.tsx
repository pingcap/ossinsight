import { css, styled } from '@mui/material';
import { getRepo } from '@site/src/api/core';
import { useRemoteData } from '@site/src/components/RemoteCharts/hook';
import { Section, SectionContent, SectionDescription, SectionTitle } from '@site/src/pages/open-source-heroes/_components/Section';
import { notNullish } from '@site/src/utils/value';
import React from 'react';
import useSWR from 'swr';

export function ContributionsSection () {
  const { data } = useSWR(['pingcap/tidb', 'gh:repo'], getRepo);
  const repoId = data?.id;
  const { data: prOverview } = useRemoteData('analyze-repo-pr-overview', { repoId }, false, notNullish(repoId));

  const items: Array<{ count: number | string, description: string, color: string }> = [
    {
      count: data?.watchers ?? '-',
      description: '✨ GitHub Stars',
      color: '#73D9B4',
    },
    {
      count: prOverview?.data[0].pull_requests ?? '-',
      description: '✏️ Pull Requests',
      color: '#5DC1ED',
    },
    {
      count: 873,
      description: '👫 Contributors',
      color: '#5DC1ED',
    },
  ];

  return (
    <Section>
      <SectionContent>
        <SectionTitle>
          TiDB ❤️ Open Source
        </SectionTitle>
        <SectionDescription>
          We take pride in our <strong>open-source</strong> roots.
          <br />
          With the developer community, we align our product, to make sure it perfectly fits modern application developer&#39;s needs.
        </SectionDescription>

        <Icon>{githubIcon}</Icon>
        <Content>
          {githubIcon}
          <Items>
            {items.map((item, index) => (
              <Item key={index} style={{ '--color1': item.color }}>
                <ItemTitle>{item.count}</ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </Item>
            ))}
          </Items>
        </Content>

        <SectionDescription sx={{ mt: 4 }}>
          <a href="https://github.com/pingcap/ossinsight" target="_blank" rel='noreferrer'>Discover TiDB on GitHub -&gt;</a>
        </SectionDescription>
      </SectionContent>
    </Section>
  );
}

const Icon = styled('div')`
  display: block;
  margin-top: 120px;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      display: none;
    `,
  })}
  > svg {
    display: block;
    margin: auto;
  }
`;

const Content = styled('div')`
  padding: 36px;
  display: flex;
  background-color: #141414;
  border-radius: 176px;
  max-width: min(1440px, 100vw - 72px);
  align-items: center;
  margin: 40px auto 0;
  justify-content: center;
  width: max-content;

  > svg {
    flex-shrink: 0;
    display: none;
    margin-right: 42px;

    ${({ theme }) => ({
      [theme.breakpoints.up('md')]: css`
        display: block;
      `,
    })}
  }
`;

const Items = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 56px;
  max-width: 100%;
`;

const Item = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ItemTitle = styled('div')`
  font-size: 24px;
  line-height: 32px;
  font-weight: 700;
  color: white;

  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      font-size: 36px;
      line-height: 48px;
    `,
  })}
`;

const ItemDescription = styled('div')`
  color: var(--color1);
  font-size: 18px;
  line-height: 30px;
  font-weight: 500;


  ${({ theme }) => ({
    [theme.breakpoints.up('md')]: css`
      font-size: 24px;
      line-height: 36px;
    `,
  })}
`;

const githubIcon = <svg width="85.2" height="84" viewBox="0 0 142 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clipPath="url(#clip0_4_501)">
    <path fillRule="evenodd" clipRule="evenodd"
          d="M70.7885 0C31.6443 0 0 32.0833 0 71.7748C0 103.502 20.2756 130.359 48.4032 139.864C51.9198 140.579 53.208 138.32 53.208 136.42C53.208 134.756 53.0921 129.052 53.0921 123.11C33.4004 127.388 29.2998 114.554 29.2998 114.554C26.1352 106.235 21.4463 104.097 21.4463 104.097C15.0013 99.7004 21.9158 99.7004 21.9158 99.7004C29.0651 100.176 32.8165 107.068 32.8165 107.068C39.1442 118 49.3407 114.911 53.4427 113.009C54.0281 108.375 55.9045 105.166 57.8969 103.384C42.1914 101.72 25.6672 95.5413 25.6672 67.9715C25.6672 60.1285 28.4782 53.7119 32.9324 48.7215C32.2297 46.9394 29.7678 39.5704 33.6366 29.7077C33.6366 29.7077 39.6137 27.806 53.0906 37.0752C58.8606 35.5041 64.8111 34.7049 70.7885 34.6981C76.7655 34.6981 82.8585 35.5308 88.4848 37.0752C101.963 27.806 107.94 29.7077 107.94 29.7077C111.809 39.5704 109.346 46.9394 108.643 48.7215C113.215 53.7119 115.91 60.1285 115.91 67.9715C115.91 95.5413 99.3855 101.601 83.5627 103.384C86.1418 105.642 88.3675 109.919 88.3675 116.693C88.3675 126.318 88.2515 134.043 88.2515 136.418C88.2515 138.32 89.5411 140.579 93.0564 139.866C121.184 130.357 141.46 103.502 141.46 71.7748C141.575 32.0833 109.815 0 70.7885 0Z"
          fill="white" />
  </g>
  <defs>
    <clipPath id="clip0_4_501">
      <rect width="142" height="140" fill="white" />
    </clipPath>
  </defs>
</svg>;
