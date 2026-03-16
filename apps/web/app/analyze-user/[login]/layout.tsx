'use client';

import Navigation, { NavItemType } from '@/components/Analyze/Navigation/Navigation';
import { ScrollspyContextProvider } from '@/components/Scrollspy';
import { CodeIcon, CommentDiscussionIcon, GraphIcon, IssueOpenedIcon, PeopleIcon, StarIcon, TelescopeIcon } from '@primer/octicons-react';

export default function UserAnalyzeLayout ({ children }: { children: React.ReactNode; }) {
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
            <div className="max-w-[1280px] px-6 pt-16 pb-0 md:px-8">{children}</div>
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
