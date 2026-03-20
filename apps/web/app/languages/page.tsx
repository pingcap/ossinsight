import type { Metadata } from 'next';
import Link from 'next/link';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { LANGUAGES } from '@/lib/server/internal-api';

export const metadata: Metadata = {
  title: 'Programming Languages on GitHub | OSSInsight',
  description: 'Explore trending GitHub repositories by programming language. See the hottest projects in JavaScript, Python, Rust, Go, and 37 more languages.',
  alternates: { canonical: '/languages' },
};

// GitHub-style language colors
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  Java: '#b07219',
  Python: '#3572A5',
  PHP: '#4F5D95',
  'C++': '#f34b7d',
  'C#': '#178600',
  TypeScript: '#3178c6',
  Shell: '#89e051',
  C: '#555555',
  Ruby: '#701516',
  Rust: '#dea584',
  Go: '#00ADD8',
  Kotlin: '#A97BFF',
  HCL: '#844FBA',
  PowerShell: '#012456',
  CMake: '#DA3434',
  Groovy: '#4298b8',
  PLpgSQL: '#336790',
  TSQL: '#e38c00',
  Dart: '#00B4AB',
  Swift: '#F05138',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Solidity: '#AA6746',
  Assembly: '#6E4C13',
  R: '#198CE7',
  Scala: '#c22d40',
  Julia: '#a270ba',
  Lua: '#000080',
  Clojure: '#db5855',
  Erlang: '#B83998',
  'Common Lisp': '#3fb68b',
  'Emacs Lisp': '#c065db',
  OCaml: '#ef7a08',
  MATLAB: '#e16737',
  'Objective-C': '#438eff',
  Perl: '#0298c3',
  Fortran: '#4d41b1',
};

export default function LanguagesPage() {
  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Languages' },
      ]} />

      <div className="mx-auto max-w-[1280px] px-6 py-12">
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
              className="group flex items-center gap-3 rounded-lg border-2 border-dashed border-[#3c3c3c] bg-transparent px-4 py-3.5 transition-[box-shadow,transform,border-color] hover:-translate-y-px hover:border-[#555] hover:shadow-[0_18px_42px_-28px_rgba(0,0,0,0.85)]"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: LANGUAGE_COLORS[lang] ?? '#8b8b8b' }}
              />
              <span className="text-sm text-white group-hover:text-[#ffe895] transition-colors">
                {lang}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
