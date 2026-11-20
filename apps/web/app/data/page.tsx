import type { Metadata } from 'next';
import { SUNSET_ANNOUNCEMENT_PATH, SUNSET_DATE_LABEL } from '@repo/site-shell/src/sunset-banner';

export const metadata: Metadata = {
  title: 'Download the OSSInsight dataset',
  description: 'The dataset behind OSSInsight will be published as Parquet files that anyone can download.',
  alternates: { canonical: '/data' },
};

const TABLES: Array<{ name: string; contents: string }> = [
  { name: 'GitHub events', contents: 'The event history OSSInsight analyzes: more than 12 billion public GitHub events.' },
  { name: 'Repositories', contents: 'Metadata for the repositories that appear in the events.' },
  { name: 'Collections', contents: 'The curated collections and the repositories in each of them.' },
  { name: 'Aggregates', contents: 'The precomputed tables behind rankings and trends.' },
];

export default function DataPage() {
  return (
    <main className="min-h-[calc(100vh-var(--site-header-height))] bg-[#1a1a1b] text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Download the OSSInsight dataset</h1>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          OSSInsight shuts down on {SUNSET_DATE_LABEL}. The data behind it will be published as Parquet files
          that anyone can download. This page will list the files as they are published and stays online after
          the shutdown.
        </p>

        <div className="mt-8 rounded-lg border border-[#ffe895]/40 bg-[#ffe895]/10 px-5 py-4 text-sm leading-relaxed text-[#ffe895]">
          <strong>No files are published yet.</strong> The export is being prepared. Because of its size, the full
          set may be completed after {SUNSET_DATE_LABEL}.
        </div>

        <h2 className="mt-12 text-xl font-semibold">What will be included</h2>
        <table className="mt-4 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/15 text-white/60">
              <th className="py-2 pr-6 font-medium">Data</th>
              <th className="py-2 font-medium">Contents</th>
            </tr>
          </thead>
          <tbody>
            {TABLES.map((table) => (
              <tr key={table.name} className="border-b border-white/10 align-top">
                <td className="whitespace-nowrap py-3 pr-6 font-medium">{table.name}</td>
                <td className="py-3 text-white/70">{table.contents}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          OSSInsight account data is not part of the dataset.
        </p>

        <h2 className="mt-12 text-xl font-semibold">Known gaps</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          Event data after May 24, 2025 is incomplete. The schema, the time range each table covers, and the
          details of this gap will be published together with the files.
        </p>

        <h2 className="mt-12 text-xl font-semibold">Need the raw events now?</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          OSSInsight is built on{' '}
          <a className="underline underline-offset-2" href="https://www.gharchive.org/" rel="noreferrer noopener" target="_blank">
            GH Archive
          </a>
          , which remains available.
        </p>

        <p className="mt-12 text-sm text-white/60">
          <a className="underline underline-offset-2" href={SUNSET_ANNOUNCEMENT_PATH}>
            Read the shutdown announcement
          </a>
        </p>
      </div>
    </main>
  );
}
