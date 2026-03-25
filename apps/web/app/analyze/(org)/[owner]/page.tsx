import { redirect } from 'next/navigation';
import Content from '@/app/analyze/(org)/[owner]/content';
import { fetchOwnerInfo } from '@/app/analyze/(org)/[owner]/fetchOwner';
import OrgAnalyzePageHeader from '@/components/Analyze/Header/OrgHeader';
import AnalyzeOwnerContextProvider from '@/components/Context/Analyze/AnalyzeOwner';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { Metadata } from 'next';

export default async function Page ({ params }: { params: Promise<{ owner: string }> }) {
  const { owner } = await params;
  const data = await fetchOwnerInfo(decodeURIComponent(owner));

  if (data.type === 'User') {
    redirect(`/analyze-user/${encodeURIComponent(data.login)}`);
  }

  const isOrg = data.type === 'Organization';
  const displayName = data.name || data.login;
  const typeLabel = isOrg ? 'Organization' : 'Developer';

  return (
    <AnalyzeOwnerContextProvider data={data}>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Analyze', url: '/analyze' },
        { name: displayName },
      ]} />
      <div className="sr-only">
        <h1>{displayName} — GitHub {typeLabel} Analytics</h1>
        <p>
          {displayName} is an open source {typeLabel.toLowerCase()} on GitHub
          {data.bio ? `: ${data.bio}` : '.'}
        </p>
        <ul>
          {data.public_repos != null && <li>{data.public_repos.toLocaleString()} public repositories</li>}
        </ul>
        <p>
          This page provides real-time analytics for the GitHub {typeLabel.toLowerCase()} {displayName},
          including star growth, issue activity, participant engagement, contributor origins,
          code submission trends, pull request efficiency, and code review metrics.
          Data is sourced from GitHub events via GH Archive and updated in near real-time.
        </p>
      </div>
      <OrgAnalyzePageHeader />
      <Content />
    </AnalyzeOwnerContextProvider>
  );
}

export async function generateMetadata ({ params }: { params: Promise<{ owner: string }> }): Promise<Metadata> {
  const { owner } = await params;
  const data = await fetchOwnerInfo(decodeURIComponent(owner));
  const displayName = data.name || data.login;
  const isOrg = data.type === 'Organization';
  const title = `Analyze ${displayName}`;
  const fullTitle = `${title} | OSSInsight`;
  const description = isOrg
    ? 'Unlock the power of time-flexible organization analytics, community recognition metrics, participant insights, and productivity analysis with OSSInsight.'
    : `Explore ${displayName}'s open source contributions, code activity, and collaboration metrics with OSSInsight.`;
  return {
    title,
    description,
    keywords: [
      'OSSInsight',
      isOrg ? 'organization analytics' : 'developer analytics',
      'GitHub',
      'star growth',
      'collaboration metrics',
      'participant insights',
      'productivity analysis',
    ],
    twitter: {
      title: fullTitle,
      description,
      card: 'summary_large_image',
    },
    openGraph: {
      title: fullTitle,
      description,
    },
    alternates: { canonical: `/analyze/${data.login}` },
  };
}
