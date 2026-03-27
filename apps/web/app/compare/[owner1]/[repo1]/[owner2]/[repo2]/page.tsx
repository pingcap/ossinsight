import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getRepoByName } from '@/lib/server/internal-api';
import { BreadcrumbListJsonLd, SoftwareApplicationJsonLd } from '@/components/json-ld';
import ShareButtons from '@/components/ShareButtons';
import RepoAnalyzePage from '@/app/analyze/(repo)/[owner]/[repo]/content';

interface PageProps {
  params: Promise<{ owner1: string; repo1: string; owner2: string; repo2: string }>;
}

export default async function ComparePage({ params }: PageProps) {
  const { owner1: rawOwner1, repo1: rawRepo1, owner2: rawOwner2, repo2: rawRepo2 } = await params;
  const owner1 = decodeURIComponent(rawOwner1);
  const repo1 = decodeURIComponent(rawRepo1);
  const owner2 = decodeURIComponent(rawOwner2);
  const repo2 = decodeURIComponent(rawRepo2);

  const [repoInfo, vsRepoInfo] = await Promise.all([
    getRepoByName(owner1, repo1),
    getRepoByName(owner2, repo2),
  ]);

  if (!repoInfo || !vsRepoInfo) {
    notFound();
  }

  const vsName = `${owner2}/${repo2}`;
  const nf = new Intl.NumberFormat('en');

  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Compare', url: '/compare' },
        { name: `${owner1}/${repo1}`, url: `/analyze/${owner1}/${repo1}` },
        { name: `vs ${owner2}/${repo2}` },
      ]} />
      <SoftwareApplicationJsonLd
        repoName={`${owner1}/${repo1}`}
        description={repoInfo.description}
        stars={repoInfo.stars}
        language={repoInfo.language}
        license={repoInfo.license}
        author={{
          type: repoInfo.owner?.login ? 'Organization' : 'Person',
          name: owner1,
          url: `https://github.com/${owner1}`,
        }}
      />
      <SoftwareApplicationJsonLd
        repoName={`${owner2}/${repo2}`}
        description={vsRepoInfo.description}
        stars={vsRepoInfo.stars}
        language={vsRepoInfo.language}
        license={vsRepoInfo.license}
        author={{
          type: vsRepoInfo.owner?.login ? 'Organization' : 'Person',
          name: owner2,
          url: `https://github.com/${owner2}`,
        }}
      />
      <ShareButtons
        url={`/compare/${owner1}/${repo1}/${owner2}/${repo2}`}
        title={`${owner1}/${repo1} vs ${owner2}/${repo2} — compare on OSSInsight`}
        className="fixed right-4 top-1/2 -translate-y-1/2 flex-col z-50 bg-gray-900/80 backdrop-blur rounded-lg p-1.5 shadow-lg"
        stars={(repoInfo.stars ?? 0) + (vsRepoInfo.stars ?? 0)}
        forks={(repoInfo.forks ?? 0) + (vsRepoInfo.forks ?? 0)}
        hashtags={['opensource', 'github', 'comparison']}
      />
      <div className="sr-only">
        <h1>{repoInfo.full_name} vs {vsRepoInfo.full_name} — GitHub Repository Comparison</h1>
        <p>
          Compare {repoInfo.full_name} ({nf.format(repoInfo.stars)} stars)
          vs {vsRepoInfo.full_name} ({nf.format(vsRepoInfo.stars)} stars) side by side.
          Stars, commits, pull requests, issues, contributors and more.
        </p>
      </div>
      <RepoAnalyzePage
        repoInfo={repoInfo}
        vsRepoInfo={vsRepoInfo}
        vsName={vsName}
      />
    </>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { owner1: rawOwner1, repo1: rawRepo1, owner2: rawOwner2, repo2: rawRepo2 } = await params;
  const owner1 = decodeURIComponent(rawOwner1);
  const repo1 = decodeURIComponent(rawRepo1);
  const owner2 = decodeURIComponent(rawOwner2);
  const repo2 = decodeURIComponent(rawRepo2);

  const name1 = `${owner1}/${repo1}`;
  const name2 = `${owner2}/${repo2}`;
  const title = `${name1} vs ${name2} — GitHub Comparison`;
  const fullTitle = `${title} | OSSInsight`;

  let description = `Compare ${name1} vs ${name2} — stars, commits, contributors and more.`;

  try {
    const [repoInfo, vsRepoInfo] = await Promise.all([
      getRepoByName(owner1, repo1),
      getRepoByName(owner2, repo2),
    ]);
    if (repoInfo && vsRepoInfo) {
      const nf = new Intl.NumberFormat('en');
      description = `Compare ${name1} (${nf.format(repoInfo.stars)}\u2B50) vs ${name2} (${nf.format(vsRepoInfo.stars)}\u2B50) — stars, commits, contributors, pull requests, and more.`;
    }
  } catch (error) {
    console.warn(`[compare] Failed to fetch repo info for ${name1} vs ${name2} metadata:`, error);
  }

  return {
    title,
    description,
    keywords: ['OSSInsight', 'GitHub', 'comparison', repo1, repo2, owner1, owner2, name1, name2],
    twitter: { title: fullTitle, description, card: 'summary_large_image' },
    openGraph: { title: fullTitle, description },
    alternates: { canonical: `/compare/${owner1}/${repo1}/${owner2}/${repo2}` },
  };
}
