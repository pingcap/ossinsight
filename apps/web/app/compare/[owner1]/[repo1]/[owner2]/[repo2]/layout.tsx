'use client';

import Navigation, { NavItemType } from '@/components/Analyze/Navigation/Navigation';
import { ScrollspyContextProvider } from '@/components/Scrollspy';
import { StarIcon, PeopleIcon, GitCommitIcon, GitPullRequestIcon, IssueOpenedIcon, RepoIcon, PersonIcon, GraphIcon, PulseIcon } from '@primer/octicons-react';

export default function RepoAnalyzeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScrollspyContextProvider>
      <div className="flex">
        <div className="flex w-full flex-col md:flex-row">
          <aside className="hidden border-r border-[#2f3032] bg-[#242526] md:block md:w-[160px] md:flex-none md:min-h-[calc(100vh-var(--site-header-height))]">
            <div className="sticky top-[var(--site-header-height)] h-full max-h-[calc(100vh-var(--site-header-height))] overflow-y-auto styled-scrollbar">
              <Navigation items={navItems} />
            </div>
          </aside>
          <main className="flex-1 block">
            <div className="max-w-[1280px] px-6 py-0 md:px-8">{children}</div>
          </main>
        </div>
      </div>
    </ScrollspyContextProvider>
  );
}

const navItems: NavItemType[] = [
  {
    id: 'divider-analytics',
    title: 'Analytics',
    isDivider: true,
    Icon: GraphIcon,
  },
  {
    id: 'overview',
    title: 'Overview',
    anchor: 'overview',
    Icon: StarIcon,
  },
  {
    id: 'people',
    title: 'People',
    anchor: 'people',
    Icon: PeopleIcon,
  },
  {
    id: 'commits',
    title: 'Commits',
    anchor: 'commits',
    Icon: GitCommitIcon,
  },
  {
    id: 'pull-requests',
    title: 'Pull Requests',
    anchor: 'pull-requests',
    Icon: GitPullRequestIcon,
  },
  {
    id: 'issues',
    title: 'Issues',
    anchor: 'issues',
    Icon: IssueOpenedIcon,
  },
  {
    id: 'divider-monthly',
    title: 'Monthly Stats',
    isDivider: true,
    Icon: PulseIcon,
  },
  {
    id: 'repository',
    title: 'Repository',
    anchor: 'repository',
    Icon: RepoIcon,
  },
  {
    id: 'contributors',
    title: 'Contributors',
    anchor: 'contributors',
    Icon: PersonIcon,
  },
];
