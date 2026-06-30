import Link from 'next/link';
import { ArrowLeft, BarChart3, Clock3, Wrench } from 'lucide-react';

export function ExploreMaintenance() {
  return (
    <main className="min-h-[calc(100vh-var(--site-header-height))] bg-[#1a1a1b] text-white">
      <section className="mx-auto flex min-h-[calc(100vh-var(--site-header-height))] w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="max-w-2xl">
          <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-[#242526] text-[#FFE895]">
            <Wrench className="h-6 w-6" aria-hidden="true" />
          </div>

          <p className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-[#FFE895]">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            维护中
          </p>

          <h1 className="text-4xl font-semibold leading-tight text-[#f4f4f5] sm:text-5xl">
            Data Explorer 正在维护中
          </h1>

          <p className="mt-6 text-lg leading-8 text-[#c8c8c8]">
            Explore 功能正在更新，暂时不可用。你仍然可以查看仓库分析、
            Collections 和 Trending 页面。
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-[#FFE895] px-5 text-sm font-semibold text-[#1f1e28] transition hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              返回首页
            </Link>
            <Link
              href="/trending"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-[#242526] px-5 text-sm font-semibold text-[#f4f4f5] transition hover:border-white/20 hover:bg-[#2c2d2f]"
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              查看 Trending
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
