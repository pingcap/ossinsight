import {
  getHotCollections,
  listCollectionPreviewRepos,
  listCollections,
  normalizeCollectionSort,
  searchCollections,
} from '@/lib/server/internal-api';
import type { Metadata } from 'next';
import { BreadcrumbListJsonLd } from '@/components/json-ld';
import { CollectionsList } from './content';

export const metadata: Metadata = {
  title: 'Explore Collections',
  description: 'Find insights about the monthly or historical rankings and trends in technical fields with curated repository lists.',
};

export const revalidate = 3600;

type PageSearchParams = {
  page?: string | string[];
  pageSize?: string | string[];
  q?: string | string[];
  keyword?: string | string[];
  sort?: string | string[];
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const keyword = getSingleSearchParam(resolvedSearchParams.q) ?? getSingleSearchParam(resolvedSearchParams.keyword) ?? '';
  const sortParam = getSingleSearchParam(resolvedSearchParams.sort);
  const sort = sortParam ? normalizeCollectionSort(sortParam) : 'recent';
  const page = getSingleSearchParam(resolvedSearchParams.page) ?? '1';
  const pageSize = getSingleSearchParam(resolvedSearchParams.pageSize) ?? '12';

  const [result, hotCollections, allCollections] = await Promise.all([
    searchCollections({
      keyword,
      sort,
      page,
      pageSize,
    }),
    getHotCollections(),
    listCollections(),
  ]);

  const previewItems = await listCollectionPreviewRepos(result.data.map((collection) => collection.id));
  const normalizedPreviewItems = previewItems.map((item) => {
    const collection = result.data.find((entry) => entry.id === item.collection_id);

    return {
      id: item.collection_id,
      name: collection?.name ?? '',
      visits: 0,
      repos: item.repo_count,
      rank: item.repo_rank,
      rank_changes: 0,
      repo_name: item.repo_name,
      repo_id: item.repo_id,
    };
  });

  return (
    <>
      <BreadcrumbListJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Collections' },
      ]} />
      <div className="sr-only">
        <h1>Open Source Repository Collections — OSSInsight</h1>
        <p>
          Browse {allCollections.length}+ curated collections of GitHub repositories grouped by technology domain.
          Each collection ranks repositories by stars, pull requests, issues, and contributors,
          with month-to-month comparisons and year-to-year historical trends since 2011.
        </p>
        <ul>
          {allCollections.slice(0, 50).map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      </div>
      <CollectionsList
        collections={result.data}
        allCollections={allCollections}
        hotItems={hotCollections.data ?? []}
        previewItems={normalizedPreviewItems}
        keyword={result.keyword}
        sort={result.sort}
        pagination={result.pagination}
      />
    </>
  );
}
