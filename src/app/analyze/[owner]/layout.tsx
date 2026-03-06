'use client';

import Navigation, { NavItemType } from '@/components/Analyze/Navigation/Navigation';
import { ScrollspyContextProvider } from '@/components/Scrollspy';
import { IssueOpenedIcon, PeopleIcon, StarIcon, TelescopeIcon, ToolsIcon } from '@primer/octicons-react';

export default function UserOrgAnalyzeLayout ({ children }: { children: React.ReactNode; }) {
  return (
    <ScrollspyContextProvider>
      <div className="flex">
        <div className="flex w-full flex-col md:flex-row">
          <aside className="bg-toolbar border-r md:min-h-[calc(100vh-var(--site-header-height))]">
            <div className="sticky top-[var(--site-header-height)] h-full overflow-y-auto max-h-[calc(100vh-var(--site-header-height))] styled-scrollbar">
              <Navigation items={navItems} />
            </div>
          </aside>
          <main className="flex-1 block">
            <div className={`p-8 max-w-[1200px] mx-auto`}>{children}</div>
          </main>
        </div>
      </div>
    </ScrollspyContextProvider>
  );
}

const navItems: NavItemType[] = [
  {
    id: 'overview',
    title: 'Organization Overview',
    anchor: 'overview',
    Icon: TelescopeIcon,
  },
  {
    id: 'popularity',
    title: 'Popularity',
    Icon: StarIcon,
    children: [
      {
        id: 'star-growth',
        title: 'Star Growth',
        anchor: 'star-growth',
      },
    ],
  },
  {
    id: 'participant',
    title: 'Participant',
    Icon: PeopleIcon,
    children: [
      {
        id: 'engagement',
        title: 'Engagement',
        anchor: 'engagement',
      },
      {
        id: 'origins',
        title: 'Origins',
        anchor: 'origins',
      },
    ],
  },
  {
    id: 'productivity',
    title: 'Productivity',
    Icon: ToolsIcon,
    children: [
      {
        id: 'pull-request-efficiency',
        title: 'Pull Request',
        anchor: 'pull-request-efficiency',
      },
      {
        id: 'code-review-efficiency',
        title: 'Code Review',
        anchor: 'code-review-efficiency',
      },
      {
        id: 'code-submission',
        title: 'Code Submission',
        anchor: 'code-submission',
      },
    ],
  },
  {
    id: 'issue',
    title: 'Issue',
    Icon: IssueOpenedIcon,
    anchor: 'issue',
  },
];

