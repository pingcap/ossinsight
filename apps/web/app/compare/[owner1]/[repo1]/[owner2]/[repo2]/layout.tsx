'use client';

import Navigation, { NavItemType } from '@/components/Analyze/Navigation/Navigation';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { ScrollspyContextProvider } from '@/components/Scrollspy';
import { StarIcon, PeopleIcon, GitCommitIcon, GitPullRequestIcon, IssueOpenedIcon, RepoIcon, PersonIcon } from '@primer/octicons-react';

export default function RepoAnalyzeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScrollspyContextProvider>
      <div className="flex">
        <div className="flex w-full flex-col md:flex-row">
          <CollapsibleSidebar>
            <Navigation items={navItems} />
          </CollapsibleSidebar>
          <main className="flex-1 block min-w-0 overflow-x-hidden">
            <div className="px-6 py-4 pr-[10%] md:px-8 md:py-4 md:pr-[10%]">{children}</div>
          </main>
        </div>
      </div>
    </ScrollspyContextProvider>
  );
}

const navItems: NavItemType[] = [
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
