'use client';

import Navigation, { NavItemType } from '@/components/Analyze/Navigation/Navigation';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { ScrollspyContextProvider } from '@/components/Scrollspy';
import { IssueOpenedIcon, PeopleIcon, StarIcon, TelescopeIcon, ToolsIcon } from '@primer/octicons-react';

export default function UserOrgAnalyzeLayout ({ children }: { children: React.ReactNode; }) {
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
