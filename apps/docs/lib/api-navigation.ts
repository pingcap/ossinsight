import type { Folder, Item } from 'fumadocs-core/page-tree';

export type ApiNavItem = {
  label: string;
  method: string;
  slug: string;
};

export type ApiNavGroup = {
  items: ApiNavItem[];
  label: string;
};

export const apiNavGroups: ApiNavGroup[] = [
  {
    label: 'Collections',
    items: [
      { slug: 'list-collections', label: 'List collections', method: 'GET' },
      { slug: 'list-hot-collections', label: 'List hot collections', method: 'GET' },
      { slug: 'collection-repo-ranking-by-issues', label: 'Repository ranking by issues', method: 'GET' },
      { slug: 'collection-repo-ranking-by-prs', label: 'Repository ranking by prs', method: 'GET' },
      { slug: 'collection-repo-ranking-by-stars', label: 'Repository ranking by stars', method: 'GET' },
      { slug: 'list-repos-of-collection', label: 'List collection repositories', method: 'GET' },
    ],
  },
  {
    label: 'Trends',
    items: [
      { slug: 'list-trending-repos', label: 'List trending repos', method: 'GET' },
    ],
  },
  {
    label: 'Issue Creators',
    items: [
      { slug: 'list-issue-creators', label: 'List issue creators', method: 'GET' },
      { slug: 'list-countries-of-issue-creators', label: 'List countries/regions of issue creators', method: 'GET' },
      { slug: 'issue-creators-history', label: 'Issue creators history', method: 'GET' },
      { slug: 'list-organizations-of-issue-creators', label: 'List organizations of stargazers', method: 'GET' },
    ],
  },
  {
    label: 'Pull Request Creators',
    items: [
      { slug: 'list-pull-request-creators', label: 'List pull request creators', method: 'GET' },
      { slug: 'list-countries-of-pr-creators', label: 'List countries/regions of PR creators', method: 'GET' },
      { slug: 'pull-request-creators-history', label: 'Pull request creators history', method: 'GET' },
      { slug: 'list-organizations-of-pr-creators', label: 'List organizations of PR creators', method: 'GET' },
    ],
  },
  {
    label: 'Stargazers',
    items: [
      { slug: 'list-countries-of-stargazers', label: 'List countries/regions of stargazers', method: 'GET' },
      { slug: 'stargazers-history', label: 'Stargazers history', method: 'GET' },
      { slug: 'list-organizations-of-stargazers', label: 'List organizations of stargazers', method: 'GET' },
    ],
  },
];

export const apiShowcaseLinks = [
  { href: 'https://github1s.com/', label: 'github1s.com', description: 'One second to read GitHub code with VS Code.' },
  { href: 'https://www.raycast.com/k8scat/ossinsight', label: 'Raycast OSS Insight', description: 'A Raycast extension powered by OSS Insight APIs.' },
  { href: 'https://github.com/tsui66/ChatGH', label: 'ChatGH', description: 'Chat with GitHub APIs using natural language.' },
  { href: 'https://github.com/hooopo/ossinsight-x', label: 'ossinsight-x', description: 'Automatically post trending repositories to social media every day.' },
];

function toApiPageItem(item: ApiNavItem): Item {
  return {
    type: 'page',
    name: item.label,
    url: `/docs/api/${item.slug}`,
  };
}

export function buildApiFolderTree(): Folder {
  return {
    type: 'folder',
    name: 'API',
    defaultOpen: true,
    index: {
      type: 'page',
      name: 'Introduction',
      url: '/docs/api',
    },
    children: [
      ...apiNavGroups.map((group) => ({
        type: 'folder' as const,
        name: group.label,
        defaultOpen: true,
        collapsible: true,
        children: group.items.map(toApiPageItem),
      })),
      {
        type: 'page',
        name: 'Showcase',
        url: '/docs/api#showcase',
      },
    ],
  };
}
