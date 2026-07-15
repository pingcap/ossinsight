import type { Metadata } from 'next';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { ExploreMaintenance } from './maintenance';

export const metadata: Metadata = {
  title: 'Data Explorer Under Maintenance',
  description: 'OSSInsight Data Explorer is temporarily unavailable while we make improvements.',
  openGraph: {
    title: 'Data Explorer Under Maintenance | OSSInsight',
    description: 'OSSInsight Data Explorer is temporarily unavailable while we make improvements.',
  },
  twitter: {
    title: 'Data Explorer Under Maintenance | OSSInsight',
    description: 'OSSInsight Data Explorer is temporarily unavailable while we make improvements.',
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
      <ExploreMaintenance />
    </>
  );
}
