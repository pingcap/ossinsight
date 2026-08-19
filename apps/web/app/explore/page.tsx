import type { Metadata } from 'next';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { ExploreMaintenance } from './maintenance';

export const metadata: Metadata = {
  title: 'Data Explorer — Under Maintenance',
  description: 'OSSInsight Data Explorer is under maintenance and temporarily unavailable.',
  openGraph: {
    title: 'Data Explorer — Under Maintenance | OSSInsight',
    description: 'OSSInsight Data Explorer is under maintenance and temporarily unavailable.',
  },
  twitter: {
    title: 'Data Explorer — Under Maintenance | OSSInsight',
    description: 'OSSInsight Data Explorer is under maintenance and temporarily unavailable.',
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
