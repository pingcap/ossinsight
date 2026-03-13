export type CollectionMetric = 'stars' | 'pull-requests' | 'pull-request-creators' | 'issues';
export type CollectionRankingMetric = Exclude<CollectionMetric, 'pull-request-creators'>;
export type CollectionRankRange = 'last-28-days' | 'month';
export type CollectionSort = 'popular' | 'az' | 'recent';

export const COLLECTION_CONFIGS_REPO_URL = 'https://github.com/pingcap/ossinsight/tree/main/configs';

export type CollectionDimension<TKey extends CollectionMetric = CollectionMetric> = {
  key: TKey;
  title: string;
  accent: string;
};

export type CollectionSortOption = {
  value: CollectionSort;
  label: string;
};

export const collectionRankingDimensions: CollectionDimension<CollectionRankingMetric>[] = [
  { key: 'stars', title: 'Stars', accent: 'ST' },
  { key: 'pull-requests', title: 'Pull Requests', accent: 'PR' },
  { key: 'issues', title: 'Issues', accent: 'IS' },
];

export const collectionHistoryDimensions: CollectionDimension[] = [
  { key: 'stars', title: 'Stars', accent: 'ST' },
  { key: 'pull-requests', title: 'Pull Requests', accent: 'PR' },
  { key: 'pull-request-creators', title: 'Pull Request Creators', accent: 'PC' },
  { key: 'issues', title: 'Issues', accent: 'IS' },
];

export const collectionSortOptions: CollectionSortOption[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'az', label: 'A to Z' },
];

export function toCollectionSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function getCollectionRankingQueryName(metric: CollectionRankingMetric, range: CollectionRankRange) {
  return `collection-${metric}-${range}-rank`;
}

export function getCollectionHistoryQueryName(metric: CollectionMetric) {
  return `collection-${metric}-history`;
}

export function getCollectionHistoryRankQueryName(metric: CollectionMetric) {
  return `collection-${metric}-history-rank`;
}

export function getCollectionsDataPath() {
  return '/collections/api';
}

export function getCollectionsHotPath() {
  return '/collections/api/hot';
}

export function getCollectionsHotExplainPath() {
  return '/collections/api/hot/explain';
}

export function getCollectionRankingPath(
  collectionId: number | string,
  metric: CollectionRankingMetric,
  range: CollectionRankRange,
) {
  const searchParams = new URLSearchParams({
    metric,
    range,
  });
  return `/collections/api/${collectionId}/ranking?${searchParams.toString()}`;
}

export function getCollectionRankingExplainPath(
  collectionId: number | string,
  metric: CollectionRankingMetric,
  range: CollectionRankRange,
) {
  const searchParams = new URLSearchParams({
    metric,
    range,
  });
  return `/collections/api/${collectionId}/ranking/explain?${searchParams.toString()}`;
}

export function getCollectionHistoryPath(collectionId: number | string, metric: CollectionMetric) {
  const searchParams = new URLSearchParams({ metric });
  return `/collections/api/${collectionId}/history?${searchParams.toString()}`;
}

export function getCollectionHistoryExplainPath(collectionId: number | string, metric: CollectionMetric) {
  const searchParams = new URLSearchParams({ metric });
  return `/collections/api/${collectionId}/history/explain?${searchParams.toString()}`;
}

export function getCollectionHistoryRankPath(collectionId: number | string, metric: CollectionMetric) {
  const searchParams = new URLSearchParams({ metric });
  return `/collections/api/${collectionId}/history-rank?${searchParams.toString()}`;
}

export function getCollectionHistoryRankExplainPath(collectionId: number | string, metric: CollectionMetric) {
  const searchParams = new URLSearchParams({ metric });
  return `/collections/api/${collectionId}/history-rank/explain?${searchParams.toString()}`;
}
