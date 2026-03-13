import type { LinkItemType } from 'fumadocs-ui/layouts/shared';
import { getSiteAppOrigin } from '../../../packages/site-shell/src/site-links';

function getWebOrigin(env: NodeJS.ProcessEnv = process.env) {
  return getSiteAppOrigin('web', env);
}

export function getLayoutLinks(): LinkItemType[] {
  const web = getWebOrigin();

  return [
    {
      text: 'Data Explorer',
      url: `${web}/explore`,
      external: true,
      on: 'nav',
    },
    {
      text: 'Collections',
      url: `${web}/collections`,
      external: true,
      on: 'nav',
    },
    {
      text: 'Blog',
      url: '/blog',
      on: 'nav',
    },
    {
      text: 'API',
      url: '/docs/api',
      on: 'nav',
    },
  ];
}

export function getDocsNav() {
  return {
    title: 'OSS Insight Docs',
    url: '/docs',
  };
}

export function getHomeNav() {
  return {
    title: 'OSS Insight Docs',
    url: '/',
  };
}

export const githubUrl = 'https://github.com/pingcap/ossinsight';
