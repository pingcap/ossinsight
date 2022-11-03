import { params } from '@query/trending-repos/params.json';
import { AsyncData, RemoteData, useRemoteData } from '@site/src/components/RemoteCharts/hook';
import React, { DependencyList, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelectParam } from '@site/src/components/params';
import TileSelect, { TileSelectOption } from '@site/src//components/TileSelect';
import { paramCase } from 'param-case';
import { GitMergeIcon, ProjectIcon, RepoForkedIcon, RepoPushIcon, StarIcon } from '@primer/octicons-react';
import { isNullish } from '@site/src/utils/value';

export type Language = string;
export type Period = string;

export const periods: Period[] = params.find(param => param.name === 'period')?.enums ?? [];
export const languages: Language[] = Object.keys(params.find(param => param.name === 'language')?.template ?? {});

const periodOptions = periods.map(period => ({ key: period, title: snakeToCamel(period) }));
const languageOptions = languages.map(language => ({ key: language, label: language }));
const orderOptions: TileSelectOption[] = [
  {
    key: 'total_score',
    label: 'Score',
    icon: <ProjectIcon className="rotate-180" />,
  },
  {
    key: 'stars',
    label: 'Stars',
    icon: <StarIcon />,
  }, {
    key: 'forks',
    label: 'Forks',
    icon: <RepoForkedIcon />,
  },
  {
    key: 'pushes',
    label: 'Pushes',
    icon: <RepoPushIcon />,
  },
  {
    key: 'pull_requests',
    label: 'PRs',
    icon: <GitMergeIcon />,
  },
];

export type TopListData = {
  repo_id: number;
  repo_name: string;
  description: string;
  stars: number;
  pushes: number;
  pull_requests: number;
  forks: number;
  total_score: number;
  language: Language;
  // csv
  contributor_logins: string;
  // csv
  collection_names: string;
};

export type ProcessedTopListData = Omit<TopListData, 'contributor_logins' | 'collection_names'> & {
  contributor_logins: string[];
  collection_names: string[];
};

export function useTopList (language: Language, period: Period, orderBy: keyof TopListData): AsyncData<RemoteData<any, ProcessedTopListData>> {
  const { data, loading, error } = useRemoteData<any, TopListData>('trending-repos', {
    language,
    period,
  }, false);

  const processedData: RemoteData<any, ProcessedTopListData> | undefined = useMemo(() => {
    if (isNullish(data)) {
      return undefined;
    }
    return {
      ...data,
      data: data.data
        .slice()
        .sort((a, b) => ((b[orderBy] as number) ?? 0) - (a[orderBy] as number) ?? 0)
        .map(item => ({
          ...item,
          contributor_logins: item.contributor_logins?.split(','),
          collection_names: item.collection_names?.split(','),
        })),
    };
  }, [data, orderBy]);

  return { data: processedData, loading, error };
}

export function useLanguages () {
  const [value, setValue] = useState<Language>(languageOptions[0].key);

  const select = (
    <TileSelect value={value} onSelect={setValue} options={languageOptions} />
  );

  return { select, value };
}

export function usePeriods () {
  return useSelectParam<string, false>(periodOptions, periodOptions[0], '', { variant: 'standard' }, {
    disableUnderline: true,
    sx: { font: 'inherit', color: 'primary.main', lineHeight: 'inherit', '.MuiSelect-select': { pb: 0 } },
  });
}

export function useOrderBy () {
  const [value, setValue] = useState<string>(orderOptions[0].key);

  const select = (
    <TileSelect value={value} onSelect={setValue} options={orderOptions} />
  );

  return { select, value };
}

function snakeToCamel (n) {
  return paramCase(n)
    .replace(/^\w/g, a => a.toUpperCase())
    .replace(/-/g, ' ');
}

export function usePagination (data: RemoteData<any, ProcessedTopListData> | undefined, deps: DependencyList) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    setPage(0);
  }, deps);

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, [setPage]);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, [setPage, setRowsPerPage]);

  const list = useMemo(() => {
    if (isNullish(data)) {
      return undefined;
    }
    return data.data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [data, page, rowsPerPage]);

  return { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage, list };
}
