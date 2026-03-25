import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getRepoByName } from '@/lib/server/internal-api';
import { BreadcrumbListJsonLd, SoftwareApplicationJsonLd } from '@/components/json-ld';
import { Breadcrumb } from '@/components/Breadcrumb';
import ShareButtons from '@/components/ShareButtons';
import RepoAnalyzePage from './content';

interface PageProps {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ vs?: string }>;
}

async function fetchRepoInfo(owner: string, repo: string) {
  return getRepoByName(owner, repo);
}

export default async function Page({ params, searchParams }: PageProps) {
  const { owner: rawOwner, repo: rawRepo } = await params;
  const { vs } = await searchParams;
  const owner = decodeURIComponent(rawOwner);
  const repo = decodeURIComponent(rawRepo);
  const repoInfo = await fetchRepoInfo(owner, repo);

  if (!repoInfo) {
    redirect('/404');
  }

  // 301 redirect comparisons to dedicated /compare route
  if (vs) {
    const [vsOwner, vsRepo] = vs.split('/');
    if (vsOwner && vsRepo) {
      redirect(`/compare/${owner}/${repo}/${vsOwner}/${vsRepo}`);
    }
  }

  const vsRepoInfo = null;

  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Analyze', url: '/analyze' },
        { name: `${owner}/${repo}` },
      ]} />
      <SoftwareApplicationJsonLd
        repoName={`${owner}/${repo}`}
        description={repoInfo.description}
        stars={repoInfo.stars}
        language={repoInfo.language}
        license={repoInfo.license}
        author={{
          type: repoInfo.owner?.login ? 'Organization' : 'Person',
          name: owner,
          url: `https://github.com/${owner}`,
        }}
      />
      <div className="mx-auto max-w-[1280px] px-6 sm:px-8">
        <Breadcrumb
          items={[
            { name: 'Analyze', href: '/analyze' },
            { name: owner, href: `/analyze/${owner}` },
            { name: repo },
          ]}
        />
      </div>
      <ShareButtons
        url={`/analyze/${owner}/${repo}`}
        title={`${owner}/${repo} — check the full analytics on OSSInsight`}
        className="fixed right-4 top-1/2 -translate-y-1/2 flex-col z-50 bg-gray-900/80 backdrop-blur rounded-lg p-1.5 shadow-lg"
        stars={repoInfo.stars ?? undefined}
        forks={repoInfo.forks ?? undefined}
        language={repoInfo.language ?? undefined}
        hashtags={['opensource', 'github']}
      />
      <div className="sr-only">
        <h1>{repoInfo.full_name} — GitHub Repository Analytics</h1>
        <p>
          {repoInfo.full_name} is a{repoInfo.language ? ` ${repoInfo.language}` : ''} open source project on GitHub
          {repoInfo.description ? `: ${repoInfo.description}` : '.'}
        </p>
        <ul>
          {repoInfo.stars != null && <li>{repoInfo.stars.toLocaleString()} stars</li>}
          {repoInfo.forks != null && <li>{repoInfo.forks.toLocaleString()} forks</li>}
          {repoInfo.language && <li>Primary language: {repoInfo.language}</li>}
          {repoInfo.default_branch && <li>Default branch: {repoInfo.default_branch}</li>}
        </ul>
        <p>
          This page provides real-time analytics for {repoInfo.full_name}, including star history,
          commit activity, pull request and issue trends, contributor statistics, geographic distribution,
          and code change frequency. Data is sourced from GitHub events via GH Archive and updated in near real-time.
        </p>
        {vsRepoInfo && (
          <p>
            Comparing {repoInfo.full_name} ({repoInfo.stars?.toLocaleString()} stars)
            with {vsRepoInfo.full_name} ({vsRepoInfo.stars?.toLocaleString()} stars) side by side.
          </p>
        )}
      </div>
      <RepoAnalyzePage
        repoInfo={repoInfo}
        vsRepoInfo={vsRepoInfo}
        vsName={vs}
      />
    </>
  );
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { owner: rawOwner, repo: rawRepo } = await params;
  const { vs } = await searchParams;
  const owner = decodeURIComponent(rawOwner);
  const repo = decodeURIComponent(rawRepo);
  const name = `${owner}/${repo}`;

  const title = `Analyze ${name}`;

  const fullTitle = `${title} | OSSInsight`;
  let description = `Deep insight into the GitHub repository ${name} - stars, commits, pull requests, issues, contributors and more.`;

  try {
    const repoInfo = await fetchRepoInfo(owner, repo);
    if (repoInfo) {
      const parts = [name];
      if (repoInfo.stars) parts.push(`${repoInfo.stars.toLocaleString()} stars`);
      if (repoInfo.forks) parts.push(`${repoInfo.forks.toLocaleString()} forks`);
      if (repoInfo.language) parts.push(repoInfo.language);
      description = `${parts.join(' · ')}. ${repoInfo.description || `Real-time analytics on stars, commits, issues, pull requests, and contributors.`}`;
    }
  } catch {
    // Use default description
  }

  return {
    title,
    description,
    keywords: ['OSSInsight', 'GitHub', 'analytics', owner, repo],
    twitter: { title: fullTitle, description, card: 'summary_large_image' },
    openGraph: { title: fullTitle, description },
    alternates: { canonical: `/analyze/${owner}/${repo}` },
  };
}
