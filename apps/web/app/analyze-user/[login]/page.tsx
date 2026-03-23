import { fetchOwnerInfo } from '@/app/analyze/(org)/[owner]/fetchOwner';
import AnalyzeOwnerContextProvider from '@/components/Context/Analyze/AnalyzeOwner';
import { BreadcrumbListJsonLd, PersonJsonLd } from '@/components/json-ld';
import { Metadata } from 'next';
import UserAnalyzeContent from './content';

export default async function Page ({ params }: { params: Promise<{ login: string }> }) {
  const { login } = await params;
  const data = await fetchOwnerInfo(decodeURIComponent(login));
  const displayName = data.name || data.login;

  return (
    <AnalyzeOwnerContextProvider data={data}>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Analyze', url: '/analyze' },
        { name: displayName },
      ]} />
      <PersonJsonLd
        name={displayName}
        login={data.login}
        bio={data.bio}
        avatarUrl={data.avatar_url}
      />
      <div className="sr-only">
        <h1>{displayName} — GitHub Developer Analytics</h1>
        <p>
          {displayName} is an open source developer on GitHub
          {data.bio ? `: ${data.bio}` : '.'}
        </p>
      </div>
      <UserAnalyzeContent />
    </AnalyzeOwnerContextProvider>
  );
}

export async function generateMetadata ({ params }: { params: Promise<{ login: string }> }): Promise<Metadata> {
  const { login } = await params;
  const data = await fetchOwnerInfo(decodeURIComponent(login));
  const displayName = data.name || data.login;
  const title = `Analyze ${displayName} | OSSInsight`;
  const description = `Explore ${displayName}'s open source contributions, code activity, and collaboration metrics with OSSInsight.`;
  return {
    title,
    description,
    keywords: ['OSSInsight', 'developer analytics', 'GitHub', displayName, 'contributions', 'pull requests'],
    twitter: { title, description, card: 'summary_large_image' },
    openGraph: { title, description },
  };
}
