import { AsyncData, useRemoteData } from '../../../components/RemoteCharts/hook';

export type CompanyInfo = {
  name: string;
  total: number;
};

export type CompanyContributionData = {
  repo_id: number;
  repo_name: string;

  contributions: number;
  pushes: number;
  pull_requests: number;
  reviews: number;
  review_comments: number;
  issues: number;
  issue_comments: number;
};

export function useCompanyList (keyword: string): AsyncData<CompanyInfo[]> {
  const { data, loading, error } = useRemoteData<any, CompanyInfo>('company-search', { keyword }, false, !!keyword);
  return {
    data: data?.data ?? [],
    loading,
    error,
  };
}

export function useCompanyContributions (companyName: string | undefined) {
  return useRemoteData('company-contribution-repos-rank', { companyName }, false, !!companyName);
}
