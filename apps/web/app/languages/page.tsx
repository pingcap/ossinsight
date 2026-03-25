import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { LANGUAGES } from '@/lib/server/internal-api';

export const metadata: Metadata = {
  title: 'Programming Languages on GitHub',
  description: 'Explore trending GitHub repositories by programming language. See the hottest projects in JavaScript, Python, Rust, Go, and 37 more languages.',
  openGraph: {
    title: 'Programming Languages on GitHub | OSSInsight',
    description: 'Explore trending GitHub repositories by programming language. See the hottest projects in JavaScript, Python, Rust, Go, and 37 more languages.',
  },
  twitter: {
    title: 'Programming Languages on GitHub | OSSInsight',
    description: 'Explore trending GitHub repositories by programming language. See the hottest projects in JavaScript, Python, Rust, Go, and 37 more languages.',
    card: 'summary_large_image',
  },
  alternates: { canonical: '/languages' },
};

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', Java: '#b07219', Python: '#3572A5', PHP: '#4F5D95',
  'C++': '#f34b7d', 'C#': '#178600', TypeScript: '#3178c6', Shell: '#89e051',
  C: '#555555', Ruby: '#701516', Rust: '#dea584', Go: '#00ADD8',
  Kotlin: '#A97BFF', HCL: '#844FBA', PowerShell: '#012456', CMake: '#DA3434',
  Groovy: '#4298b8', PLpgSQL: '#336790', TSQL: '#e38c00', Dart: '#00B4AB',
  Swift: '#F05138', HTML: '#e34c26', CSS: '#563d7c', Elixir: '#6e4a7e',
  Haskell: '#5e5086', Solidity: '#AA6746', Assembly: '#6E4C13', R: '#198CE7',
  Scala: '#c22d40', Julia: '#a270ba', Lua: '#000080', Clojure: '#db5855',
  Erlang: '#B83998', 'Common Lisp': '#3fb68b', 'Emacs Lisp': '#c065db',
  OCaml: '#ef7a08', MATLAB: '#e16737', 'Objective-C': '#438eff',
  Perl: '#0298c3', Fortran: '#4d41b1',
};

const LANGUAGE_DESCRIPTIONS: Record<string, string> = {
  JavaScript: 'The language of the web — from React to Node.js',
  TypeScript: 'Type-safe JavaScript for large-scale apps',
  Python: 'AI, ML, data science, and scripting',
  Java: 'Enterprise software and Android development',
  Go: 'Cloud infrastructure and microservices',
  Rust: 'Systems programming with memory safety',
  'C++': 'Performance-critical systems and games',
  C: 'Operating systems and embedded software',
  'C#': '.NET ecosystem and game development',
  PHP: 'Web backends powering WordPress and Laravel',
  Ruby: 'Web development with Rails',
  Swift: 'iOS and macOS native apps',
  Kotlin: 'Modern Android and server-side JVM',
  Dart: 'Cross-platform apps with Flutter',
  Shell: 'Scripting and automation',
  HTML: 'Web structure and markup',
  CSS: 'Web styling and design',
  Scala: 'Functional programming on the JVM',
  R: 'Statistical computing and data visualization',
  Lua: 'Embedded scripting and game modding',
  Elixir: 'Scalable and fault-tolerant systems',
  Haskell: 'Pure functional programming',
  Solidity: 'Smart contracts on Ethereum',
  Julia: 'High-performance scientific computing',
  Clojure: 'Lisp on the JVM',
  Erlang: 'Telecom and distributed systems',
  Perl: 'Text processing and system administration',
  'Objective-C': 'Legacy Apple platform development',
  MATLAB: 'Engineering and mathematical computation',
  Fortran: 'Scientific and numerical computing',
  Assembly: 'Low-level hardware programming',
  OCaml: 'Functional programming with type inference',
};

// Group languages by popularity tiers
const TIER_1 = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C'] as const;
const TIER_2 = LANGUAGES.filter(l => !(TIER_1 as readonly string[]).includes(l));

export default function LanguagesPage() {
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Languages' },
      ]} />

      <div className="mx-auto max-w-[1280px] px-6 py-12">
        {/* Hero section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white">
            Explore by Language
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#7c7c7c]">
            Discover the most popular and fastest-growing open source projects, organized by programming language.
            Rankings powered by real-time analysis of 10 billion+ GitHub events.
          </p>
        </div>

        {/* Tier 1: Featured languages — large cards */}
        <section className="mb-12">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[#555]">
            Most Popular
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIER_1.map((lang) => (
              <Link
                key={lang}
                href={`/languages/${encodeURIComponent(lang)}`}
                className="group relative overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 transition-all hover:-translate-y-0.5 hover:border-[#444] hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    style={{ backgroundColor: LANGUAGE_COLORS[lang] ?? '#8b8b8b' }}
                  />
                  <span className="text-lg font-semibold text-white group-hover:text-[#ffe895] transition-colors">
                    {lang}
                  </span>
                </div>
                {LANGUAGE_DESCRIPTIONS[lang] && (
                  <p className="mt-2.5 text-sm text-[#666] line-clamp-2">
                    {LANGUAGE_DESCRIPTIONS[lang]}
                  </p>
                )}
                <div className="mt-3 text-xs font-medium text-[#8fb5ff] opacity-0 group-hover:opacity-100 transition-opacity">
                  View trending repos →
                </div>
                {/* Decorative glow */}
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.15]"
                  style={{ backgroundColor: LANGUAGE_COLORS[lang] ?? '#8b8b8b' }}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Tier 2: All other languages — compact grid */}
        <section>
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[#555]">
            All Languages
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {TIER_2.map((lang) => (
              <Link
                key={lang}
                href={`/languages/${encodeURIComponent(lang)}`}
                className="group flex items-center gap-2.5 rounded-lg border border-[#2a2a2a] bg-transparent px-3.5 py-2.5 transition-all hover:border-[#444] hover:bg-[#1a1a1a]"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: LANGUAGE_COLORS[lang] ?? '#8b8b8b' }}
                />
                <span className="text-sm text-[#aaa] group-hover:text-white transition-colors truncate">
                  {lang}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
