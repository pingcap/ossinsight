import type { Metadata } from 'next';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { ExploreMaintenance } from './maintenance';

export const metadata: Metadata = {
  title: 'Data Explorer 维护中',
  description: 'OSSInsight Data Explorer 正在维护中，暂时不可用。',
  openGraph: {
    title: 'Data Explorer 维护中 | OSSInsight',
    description: 'OSSInsight Data Explorer 正在维护中，暂时不可用。',
  },
  twitter: {
    title: 'Data Explorer 维护中 | OSSInsight',
    description: 'OSSInsight Data Explorer 正在维护中，暂时不可用。',
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
