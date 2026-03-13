import Content from '@/app/analyze/(org)/[owner]/content';
import { fetchOwnerInfo } from '@/app/analyze/(org)/[owner]/fetchOwner';
import OrgAnalyzePageHeader from '@/components/Analyze/Header/OrgHeader';
import AnalyzeOwnerContextProvider from '@/components/Context/Analyze/AnalyzeOwner';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export default async function Page ({ params }: { params: Promise<{ owner: string }> }) {
  const { owner } = await params;
  const data = await fetchOwnerInfo(decodeURIComponent(owner));
  if (data.type === 'Organization') {
    return (
      <AnalyzeOwnerContextProvider data={data}>
        <BreadcrumbListJsonLd items={[
          { name: 'Home', url: '/' },
          { name: 'Analyze', url: '/analyze' },
          { name: data.name || data.login },
        ]} />
        <div className="sr-only">
          <h1>{data.name || data.login} — GitHub Organization Analytics</h1>
          <p>
            {data.name || data.login} is an open source organization on GitHub
            {data.bio ? `: ${data.bio}` : '.'}
          </p>
          <ul>
            {data.public_repos != null && <li>{data.public_repos.toLocaleString()} public repositories</li>}
          </ul>
          <p>
            This page provides real-time analytics for the GitHub organization {data.name || data.login},
            including star growth, issue activity, participant engagement, contributor origins,
            code submission trends, pull request efficiency, and code review metrics.
            Data is sourced from GitHub events via GH Archive and updated in near real-time.
          </p>
        </div>
        <OrgAnalyzePageHeader />
        <Content />
      </AnalyzeOwnerContextProvider>
    );
  } else {
    redirect(`/analyze/${owner}`);
  }
}

export async function generateMetadata ({ params }: { params: Promise<{ owner: string }> }): Promise<Metadata> {
  const { owner } = await params;
  const data = await fetchOwnerInfo(decodeURIComponent(owner));
  if (data.type === 'Organization') {
    const title = `Analyze ${data.name} | OSSInsight`
    const description = 'Unlock the power of time-flexible organization analytics, community recognition metrics, participant insights, and productivity analysis with OSSInsight.';
    return {
      title,
      description,
      keywords: [
        'OSSInsight',
        'open-source company',
        'organization analytics',
        'GitHub organization',
        'star growth',
        'collaboration metrics',
        'participant insights',
        'productivity analysis',
      ],
      twitter: {
        title,
        description,
        card: 'summary_large_image',
      },
      openGraph: {
        title,
        description,
      }
    };
  } else {
    return {};
  }
}
