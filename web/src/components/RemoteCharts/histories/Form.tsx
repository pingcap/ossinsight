/* eslint-disable */
// Deprecated
import React, { useMemo, useState } from 'react';
import { Queries } from '../queries';
import { notNullish } from '@site/src/utils/value';

import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';

export type Type<Q extends keyof Queries = any> = {
  title: string;
  key: string;
  value: {
    category: Q;
    params: Partial<Queries[Q]['params']>;
    valueIndex: keyof Queries[Q]['data'];
  };
};

export type Query<Q extends keyof Queries> = Queries[Q]['params'] & {
  category: Q;
  valueIndex: keyof Queries[Q]['data'];
  n: number;
  years: number;
};

interface UseFormResult<Q extends keyof Queries> {
  query: Query<Q>;
  form: JSX.Element;
}

const types: Type[] = [
  {
    title: 'Stars',
    key: 'stars',
    value: {
      category: 'events-history',
      params: { event: 'WatchEvent' },
      valueIndex: 'events_count',
    },
  },
  {
    title: 'Forks',
    key: 'forks',
    value: {
      category: 'events-history',
      params: { event: 'ForkEvent' },
      valueIndex: 'events_count',
    },
  },
  {
    title: 'PRs',
    key: 'PRs',
    value: {
      category: 'events-history',
      params: { event: 'PullRequestEvent' },
      valueIndex: 'events_count',
    },
  },
  {
    title: 'Contributors (PRs opened)',
    key: 'contributors-PR-opened',
    value: {
      category: 'contributors-history',
      params: { action: 'opened', merged: '*' },
      valueIndex: 'contributors_count',
    },
  },
  {
    title: 'Contributors (PRs merged)',
    key: 'contributors-PR-merged',
    value: {
      category: 'contributors-history',
      params: { action: 'closed', merged: 'true' },
      valueIndex: 'contributors_count',
    },
  },
];

const allYears = [1, 2, 5, 10];

const allLimits = [10, 20, 50];

export const useForm = ({ noSearch }) => {
  const random = useMemo(() => Math.random(), []);

  const { initialType, initialLimits, initialYears } = useMemo(() => {
    let initialType: Type = types[0];
    let initialYears = 1;
    let initialLimits = 10;
    if (!noSearch && typeof window !== 'undefined') {
      const usp = new URLSearchParams(location.search);
      const type = usp.get('type');
      const years = parseInt(usp.get('years') ?? '');
      const limits = parseInt(usp.get('n') ?? '');
      if (type) {
        const found: Type | undefined = types.find(({ key }) => key === type);
        if (notNullish(found)) {
          initialType = found;
        }
      }
      if (years && allYears.includes(years)) {
        initialYears = years;
      }
      if (limits && allLimits.includes(limits)) {
        initialLimits = limits;
      }
    }
    return { initialType, initialYears, initialLimits };
  }, []);

  const [type, setType] = useState<Type>(initialType);
  const [n, setN] = useState(initialLimits);
  const [years, setYears] = useState(initialYears);

  const query = useMemo(() => {
    if (!noSearch && typeof window !== 'undefined') {
      const usp = new window.URLSearchParams();
      usp.set('type', type.key);
      usp.set('n', String(n));
      usp.set('years', String(years));
      window.history.replaceState(null, '', '?' + usp.toString());
    }

    return {
      category: type.value.category,
      valueIndex: type.value.valueIndex,
      ...type.value.params,
      n,
      years,
    };
  }, [type, n, years]);

  const form = (
    <Stack direction='row' sx={{ flexWrap: 'wrap', alignItems: 'flex-end', gap: 4 }}>
      <FormControl variant="standard">
        <InputLabel id={`${random}-type`}>Type</InputLabel>
        <Select<Type>
          id={`${random}-type`}
          value={type}
          autoWidth
          onChange={e => setType(types.find(({ key }) => key === e.target.value) ?? types[0])}
          label="Type"
          size='small'
          renderValue={value => value.title}
        >
          {types.map(type => (
            <MenuItem key={type.key} value={type.key}>
              {type.title}
            </MenuItem>),
          )}
        </Select>
      </FormControl>
      <FormControl variant="standard">
        <TextField
          variant="standard"
          select
          value={n}
          onChange={e => setN(Number(e.target.value))}
          InputProps={{
            startAdornment: <InputAdornment position="start">Top</InputAdornment>,
          }}
        >
          {allLimits.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
        </TextField>
      </FormControl>
      <FormControl variant="standard">
        <TextField
          variant="standard"
          value={years}
          onChange={e => setYears(Number(e.target.value))}
          select
          InputProps={{
            startAdornment: <InputAdornment position="start">Recent</InputAdornment>,
            endAdornment: <InputAdornment position="start" sx={{ mr: 4 }}>Year(s)</InputAdornment>,
          }}
        >
          {allYears.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
        </TextField>
      </FormControl>
    </Stack>
  );

  return { form, query };
};
