'use client';

import React, { useMemo } from 'react';
import { AnalyzeContext, RepoInfo } from '@/components/Analyze/context';
import { StickyRepoHeader } from '@/components/Analyze/StickyRepoHeader';
import { OverviewSection } from './_sections/overview';
import { PeopleSection } from './_sections/people';
import { CommitsSection } from './_sections/commits';
import { PullRequestsSection } from './_sections/pull-requests';
import { IssuesSection } from './_sections/issues';
import { RepositorySection } from './_sections/repository';
import { ContributorsSection } from './_sections/contributors';

interface RepoAnalyzePageProps {
  repoInfo: RepoInfo;
  vsRepoInfo?: RepoInfo | null;
  vsName?: string;
}

export default function RepoAnalyzePage({ repoInfo, vsRepoInfo, vsName }: RepoAnalyzePageProps) {
  const isComparing = vsRepoInfo != null;

  const contextValue = useMemo(() => ({
    repoName: repoInfo.full_name,
    comparingRepoName: vsName,
    repoId: repoInfo.id,
    comparingRepoId: vsRepoInfo?.id,
    repoInfo,
    comparingRepoInfo: vsRepoInfo ?? undefined,
  }), [repoInfo, vsRepoInfo, vsName]);

  return (
    <AnalyzeContext.Provider value={contextValue}>
      <StickyRepoHeader repoName={repoInfo.full_name} />
      <OverviewSection />
      <PeopleSection />
      <CommitsSection />
      <PullRequestsSection />
      <IssuesSection />
      {!isComparing && (
        <>
          <RepositorySection />
          <ContributorsSection />
        </>
      )}
    </AnalyzeContext.Provider>
  );
}
