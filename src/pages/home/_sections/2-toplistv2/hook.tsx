import { params } from '../../../../../api/queries/recent-events-rank-v2/params.json';
import { AsyncData, RemoteData, useRemoteData } from "../../../../components/RemoteCharts/hook";
import React, { useMemo, useState } from "react";
import { useSelectParam } from "../../../../components/params";
import TileSelect from "../../../../components/TileSelect";

export type Language = string
export type Period = string

export const periods: Period[] = params.find(param => param.name === 'period').enums;
export const languages: Language[] = Object.keys(params.find(param => param.name === 'language').template);

const periodOptions = periods.map(period => ({ key: period, title: snakeToCamel(period) }));
const languageOptions = languages.map(language => ({ key: language, title: language }));

export type TopListData = {
  repo_id: number
  repo_name: string
  stars: number
  pushes: number
  pull_requests: number
  language: Language
  events: number
  // csv
  contributor_logins: string
  // csv
  collection_names: string
}

export type ProcessedTopListData = Omit<TopListData, 'contributor_logins' | 'collection_names'> & {
  contributor_logins: string[]
  collection_names: string[]
}


export function useTopList(language: Language, period: Period): AsyncData<RemoteData<any, ProcessedTopListData>> {
  const { data, loading, error } = useRemoteData<any, TopListData>('recent-events-rank-v2', {
    language,
    period,
  }, false);

  const processedData: RemoteData<any, ProcessedTopListData> = useMemo(() => {
    if (!data) {
      return undefined;
    }
    return {
      ...data,
      data: data.data.map(item => ({
        ...item,
        contributor_logins: item.contributor_logins?.split(','),
        collection_names: item.collection_names?.split(','),
      })),
    };
  }, [data]);

  return { data: processedData, loading, error };
}

export function useLanguages() {
  const [value, setValue] = useState<string>(languageOptions[0].key);
  const options = useMemo(() => {
    return languageOptions.map(({ key, title }) => ({ key: key, label: title }));
  }, [languageOptions]);

  const select = (
    <TileSelect value={value} onSelect={setValue} options={options} />
  );

  return { select, value };
}

export function usePeriods() {
  return useSelectParam(periodOptions, periodOptions[1], '', { variant: 'standard' }, {
    disableUnderline: true,
    sx: { font: 'inherit', color: 'primary.main', lineHeight: 'inherit', '.MuiSelect-select': { pb: 0 } },
  });
}

function snakeToCamel(n) {
  return n
  .replace(/(?<=(^|_))[a-z]/g, c => c.toUpperCase())
  .replace(/_/g, ' ');
}
