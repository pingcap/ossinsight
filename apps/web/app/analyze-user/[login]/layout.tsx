'use client';

import Navigation, { NavItemType } from '@/components/Analyze/Navigation/Navigation';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { ScrollspyContextProvider } from '@/components/Scrollspy';
import { CodeIcon, CommentDiscussionIcon, GraphIcon, IssueOpenedIcon, PeopleIcon, StarIcon, TelescopeIcon } from '@primer/octicons-react';

export default function UserAnalyzeLayout ({ children }: { children: React.ReactNode; }) {
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
    Icon: TelescopeIcon,
  },
  {
    id: 'behaviour',
    title: 'Behaviour',
    anchor: 'behaviour',
    Icon: PeopleIcon,
  },
  {
    id: 'star',
    title: 'Star',
    anchor: 'star',
    Icon: StarIcon,
  },
  {
    id: 'code',
    title: 'Code',
    anchor: 'code',
    Icon: CodeIcon,
    children: [
      {
        id: 'pushes-and-commits',
        title: 'Pushes & Commits',
        anchor: 'pushes-and-commits',
      },
      {
        id: 'pull-requests',
        title: 'Pull Requests',
        anchor: 'pull-requests',
      },
    ],
  },
  {
    id: 'code-review',
    title: 'Code Review',
    anchor: 'code-review',
    Icon: CommentDiscussionIcon,
  },
  {
    id: 'issue',
    title: 'Issue',
    anchor: 'issue',
    Icon: IssueOpenedIcon,
  },
  {
    id: 'activities',
    title: 'Activities',
    anchor: 'activities',
    Icon: GraphIcon,
  },
];
