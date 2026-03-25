import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { ExploreContent } from './content';

export const metadata: Metadata = {
  title: 'GitHub Data Explorer',
  description: 'Discover insights in GitHub event data with AI-generated SQL and preset visualizations.',
  openGraph: {
    title: 'GitHub Data Explorer | OSSInsight',
    description: 'Discover insights in GitHub event data with AI-generated SQL and preset visualizations.',
  },
  twitter: {
    title: 'GitHub Data Explorer | OSSInsight',
    description: 'Discover insights in GitHub event data with AI-generated SQL and preset visualizations.',
    card: 'summary_large_image',
  },
  alternates: { canonical: '/explore' },
};

export default function ExplorePage() {
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Data Explorer' },
      ]} />
      <div className="sr-only">
        <h1>GitHub Data Explorer</h1>
        <p>
          Discover insights in GitHub event data with AI-generated SQL. Ask questions in plain English
          about GitHub repositories, developers, and trends — OSSInsight generates and runs SQL queries
          against over 10 billion GitHub events and returns interactive visualizations.
        </p>
      </div>
      <Suspense>
        <ExploreContent />
      </Suspense>
    </>
  );
}
