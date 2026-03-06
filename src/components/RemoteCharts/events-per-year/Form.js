import React, { useMemo, useState } from 'react';

import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';

const types = [
  { title: 'Stars', value: 'WatchEvent' },
  { title: 'Forks', value: 'ForkEvent' },
  { title: 'PRs', value: 'PullRequestEvent' }
];

const allLimits = [10, 20, 50];

export const useForm = ({ noSearch }) => {
  const random = useMemo(() => Math.random(), []);

  const { initialType, initialLimits } = useMemo(() => {
    let initialType = types[0].value;
    let initialLimits = 10;
    if (!noSearch && typeof window !== 'undefined') {
      const usp = new URLSearchParams(location.search);
      const type = usp.get('type');
      const limits = parseInt(usp.get('n'));
      if (type && types.find(({ value }) => value === type)) {
        initialType = type;
      }
      if (limits && allLimits.indexOf(limits) >= 0) {
        initialLimits = limits;
      }
    }
    return { initialType, initialLimits };
  }, []);

  const [type, setType] = useState(initialType);
  const [n, setN] = useState(initialLimits);

  const query = useMemo(() => {
    if (!noSearch && typeof window !== 'undefined') {
      const usp = new window.URLSearchParams();
      usp.set('type', type);
      usp.set('n', String(n));
      window.history.replaceState(null, null, '?' + usp.toString());
    }

    return {
      event: type,
      n
    };
  }, [type, n]);

  const form = (
    <Stack direction='row' sx={{ flexWrap: 'wrap', alignItems: 'flex-end', gap: 4 }}>
      <FormControl variant="standard" sx={{ minWidth: '120px', maxWidth: '120px' }}>
        <InputLabel id={`cubechart-${random}-type`}>Type</InputLabel>
        <Select
          id={`cubechart-${random}-type`}
          value={type}
          onChange={e => setType(e.target.value)}
          label="Type"
          size='small'
        >
          {types.map(type => <MenuItem key={type.value} value={type.value}>{type.title}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl variant="standard" sx={{ minWidth: '120px', maxWidth: '120px' }}>
        <TextField
          variant="standard"
          id={`cubechart-${random}-type`}
          select
          value={n}
          onChange={e => setN(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">Top</InputAdornment>
          }}
        >
          {allLimits.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
        </TextField>
      </FormControl>
    </Stack>
  );

  return { form, query };
};
