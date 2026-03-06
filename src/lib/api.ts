const DEFAULT_API_BASE = typeof window === 'undefined' ? 'https://api.ossinsight.io' : '';

export type RemoteData<T> = {
  data: T[];
  row_count?: number;
};

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${DEFAULT_API_BASE}${path}`, {
    next: { revalidate: 300 },
    headers: {
      accept: 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

export type RepoInfo = {
  id: number;
  full_name: string;
  description?: string;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
};

export type UserInfo = {
  id: number;
  login: string;
  type: string;
  bio?: string;
  followers?: number;
  following?: number;
  public_repos?: number;
};

export type RepoOverview = {
  stars?: number | string;
  commits?: number | string;
  issues?: number | string;
  pull_request_creators?: number | string;
};

export type StarsHistory = {
  event_month?: string;
  event_day?: string;
  total?: number | string;
};

export async function getRepo(fullName: string): Promise<RepoInfo> {
  return request<RepoInfo>(`/gh/repo/${fullName}`);
}

export async function getUser(login: string): Promise<UserInfo> {
  return request<UserInfo>(`/gh/users/${login}`);
}

export async function getQuery<T>(
  queryName: string,
  params: Record<string, string | number | boolean>
): Promise<RemoteData<T>> {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => usp.set(k, String(v)));
  return request<RemoteData<T>>(`/q/${queryName}?${usp.toString()}`);
}
