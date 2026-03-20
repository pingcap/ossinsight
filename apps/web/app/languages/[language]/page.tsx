import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import {
  LANGUAGES,
  isValidLanguage,
  getTrendingReposByLanguage,
} from '@/lib/server/internal-api';

export const revalidate = 3600; // ISR: revalidate every hour
export const dynamic = 'force-dynamic'; // Don't pre-render at build time (needs DB)

interface PageProps {
  params: Promise<{ language: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { language: rawLang } = await params;
  const language = decodeURIComponent(rawLang);

  if (!isValidLanguage(language)) {
    return {};
  }

  const title = `${language} — Trending GitHub Repos | OSSInsight`;
  const description = `Discover the most popular and fastest-growing ${language} repositories on GitHub. Real-time rankings powered by 10B+ GitHub events.`;

  return {
    title,
    description,
    keywords: ['OSSInsight', 'GitHub', language, 'trending', 'repositories', 'open source'],
    openGraph: { title, description },
    twitter: { title, description, card: 'summary_large_image' },
    alternates: { canonical: `/languages/${encodeURIComponent(language)}` },
  };
}

const nf = new Intl.NumberFormat('en');

export default async function LanguagePage({ params }: PageProps) {
  const { language: rawLang } = await params;
  const language = decodeURIComponent(rawLang);

  if (!isValidLanguage(language)) {
    notFound();
  }

  const repos = await getTrendingReposByLanguage(language, 'past_month');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${language} Trending Repositories`,
    description: `Top ${language} repositories on GitHub ranked by community activity.`,
    url: `https://ossinsight.io/languages/${encodeURIComponent(language)}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'OSSInsight',
      url: 'https://ossinsight.io',
    },
  };

  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Languages', url: '/languages' },
        { name: language },
      ]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-2">
          <Link href="/languages" className="text-sm text-[#7c7c7c] hover:text-white transition-colors">
            ← All Languages
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white">
          {language}
        </h1>
        <p className="mt-3 text-base text-[#7c7c7c]">
          Trending {language} repositories on GitHub, ranked by community activity and growth over the past month.
        </p>

        {repos.length === 0 ? (
          <p className="mt-10 text-sm text-[#7c7c7c]">No trending repositories found for {language}.</p>
        ) : (
          <div className="mt-8 space-y-3">
            {repos.map((repo, index) => {
              const owner = repo.repo_name.split('/')[0] ?? '';
              return (
                <article
                  key={repo.repo_id}
                  className="flex items-start gap-4 rounded-lg border-2 border-dashed border-[#3c3c3c] bg-transparent p-4 transition-[box-shadow,transform] hover:-translate-y-px hover:shadow-[0_18px_42px_-28px_rgba(0,0,0,0.85)]"
                >
                  <div className="w-8 shrink-0 pt-1 text-center text-sm font-medium text-[#7c7c7c]">
                    {index + 1}
                  </div>

                  <img
                    src={`https://github.com/${owner}.png`}
                    alt=""
                    aria-hidden="true"
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/analyze/${repo.repo_name}`}
                      className="text-base font-medium text-white hover:text-[#ffe895] transition-colors"
                    >
                      {repo.repo_name}
                    </Link>

                    {repo.description && (
                      <p className="mt-1 text-sm text-[#7c7c7c] line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-4 text-xs text-[#7c7c7c]">
                      <span title="Stars">⭐ {nf.format(repo.stars)}</span>
                      <span title="Forks">🍴 {nf.format(repo.forks)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
