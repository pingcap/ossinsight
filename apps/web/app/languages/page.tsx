import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { LANGUAGES } from '@/lib/server/internal-api';

export const metadata: Metadata = {
  title: 'Programming Languages on GitHub | OSSInsight',
  description: 'Explore trending GitHub repositories by programming language. See the hottest projects in JavaScript, Python, Rust, Go, and 37 more languages.',
  alternates: { canonical: '/languages' },
};

export default function LanguagesPage() {
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Languages' },
      ]} />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold text-white">
          Programming Languages on GitHub
        </h1>
        <p className="mt-3 text-base text-[#7c7c7c]">
          Explore trending repositories by programming language, ranked by community activity and growth.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {LANGUAGES.map((lang) => (
            <Link
              key={lang}
              href={`/languages/${encodeURIComponent(lang)}`}
              className="group rounded-lg border-2 border-dashed border-[#3c3c3c] bg-transparent px-4 py-3 text-sm text-white transition-[box-shadow,transform] hover:-translate-y-px hover:border-[#555] hover:shadow-[0_18px_42px_-28px_rgba(0,0,0,0.85)]"
            >
              {lang}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
