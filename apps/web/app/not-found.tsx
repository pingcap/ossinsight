import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1a1b] flex flex-col items-center justify-center px-6 text-white">
      {/* Accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white" />

      {/* 404 number */}
      <div className="text-[120px] font-bold leading-none text-[#e9eaee] opacity-20 select-none mb-2">
        404
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-semibold text-white mb-3 text-center">
        Page Not Found
      </h1>

      {/* Description */}
      <p className="text-white/60 text-center max-w-md mb-10 text-base leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Try searching for a repository or exploring our collections.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-white text-[#1a1a1b] font-semibold px-6 py-3 hover:bg-white/90 transition-colors"
        >
          ← Back to Home
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center rounded-lg border border-white/20 text-white font-medium px-6 py-3 hover:bg-white/5 transition-colors"
        >
          🔍 Search Data Explorer
        </Link>
        <Link
          href="/trending"
          className="inline-flex items-center justify-center rounded-lg border border-white/20 text-white font-medium px-6 py-3 hover:bg-white/5 transition-colors"
        >
          📈 Trending Repos
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-12 text-sm text-white/40">
        <span>Try: </span>
        <Link href="/collections" className="text-white/70 hover:text-white transition-colors underline">
          Collections
        </Link>
        <span className="mx-2">·</span>
        <Link href="/trending" className="text-white/70 hover:text-white transition-colors underline">
          Trending
        </Link>
        <span className="mx-2">·</span>
        <Link href="/explore" className="text-white/70 hover:text-white transition-colors underline">
          Data Explorer
        </Link>
      </div>

      {/* Branding */}
      <div className="mt-16 text-white/20 text-sm">
        OSSInsight — Open Source Software Insight
      </div>
    </div>
  );
}
