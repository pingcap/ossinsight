import { Skeleton } from '@/components/ui/skeleton';

export function AnalyzePageSkeleton() {
  return (
    <div className="px-6 py-4 pr-[10%] md:px-8 md:py-4 md:pr-[10%]">
      {/* Title area */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full bg-white/[0.08]" />
        <Skeleton className="h-7 w-64 bg-white/[0.08]" />
      </div>
      <Skeleton className="h-4 w-96 bg-white/[0.08] mb-6" />
      {/* Overview grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Skeleton className="h-64 bg-white/[0.08] rounded" />
        <Skeleton className="h-64 bg-white/[0.08] rounded" />
      </div>
      {/* Chart sections */}
      <Skeleton className="h-6 w-48 bg-white/[0.08] mb-4" />
      <Skeleton className="h-80 bg-white/[0.08] rounded mb-8" />
      <Skeleton className="h-6 w-36 bg-white/[0.08] mb-4" />
      <Skeleton className="h-80 bg-white/[0.08] rounded" />
    </div>
  );
}

export function CollectionPageSkeleton() {
  return (
    <div className="px-6 py-4 pr-[10%] md:px-8 md:py-4 md:pr-[10%]">
      <Skeleton className="h-4 w-48 bg-white/[0.08] mb-4" />
      <Skeleton className="h-8 w-72 bg-white/[0.08] mb-4" />
      <Skeleton className="h-4 w-96 bg-white/[0.08] mb-8" />
      <Skeleton className="h-96 bg-white/[0.08] rounded" />
    </div>
  );
}
