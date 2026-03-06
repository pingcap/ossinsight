import Link from 'next/link';
import { getQuery, getRepo, RepoOverview, StarsHistory } from '@/lib/api';

type Params = {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
};

function toNumber(v: number | string | undefined): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v) || 0;
  return 0;
}

export default async function AnalyzeRepoPage({ params }: Params) {
  const { owner, repo: repoName } = await params;
  const fullName = `${decodeURIComponent(owner)}/${decodeURIComponent(repoName)}`;
  const repo = await getRepo(fullName);

  const [overview, stars] = await Promise.all([
    getQuery<RepoOverview>('analyze-repo-overview', { repoId: repo.id }),
    getQuery<StarsHistory>('analyze-stars-history', { repoId: repo.id })
  ]);

  const metrics = overview.data[0] || {};
  const starsRows = stars.data.slice(-12);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-6">
      <section className="rounded-3xl border border-teal-100 bg-white/90 p-8 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Analyze Repository</p>
        <h1 className="mt-3 text-4xl font-bold text-ink">{repo.full_name}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{repo.description || 'No description.'}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-mist px-3 py-1">Language: {repo.language || 'Unknown'}</span>
          <a className="rounded-full bg-slate-100 px-3 py-1" href={`https://github.com/${repo.full_name}`} target="_blank">
            Open on GitHub
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Stars" value={toNumber(metrics.stars)} />
        <MetricCard title="Commits" value={toNumber(metrics.commits)} />
        <MetricCard title="Issues" value={toNumber(metrics.issues)} />
        <MetricCard title="PR Creators" value={toNumber(metrics.pull_request_creators)} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-panel">
        <h2 className="text-xl font-semibold text-ink">Stars History (Last 12 points)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Total Stars</th>
              </tr>
            </thead>
            <tbody>
              {starsRows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{row.event_month || row.event_day || '-'}</td>
                  <td className="py-2 pr-4">{toNumber(row.total).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Link className="text-sm text-teal-700 underline" href="/widgets">
        Back to widgets home
      </Link>
    </main>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <article className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-panel">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-ink">{value.toLocaleString()}</p>
    </article>
  );
}
