import React, { useMemo, useState } from 'react';
import { SelectProps } from '@mui/material/Select';
import {
  FormControl,
  InputLabel,
  unstable_useId,
  useEventCallback,
  Select,
  MenuItem,
  FormControlProps,
} from '@mui/material';
import { isString } from 'ahooks/es/utils';

export type SelectParamOption<K extends string | number = string> = {
  key: K;
  title: string;
};

function renderSelectParamOption<K extends string | number> (option: SelectParamOption<K> | '') {
  return isString(option) ? '' : option.title;
}

interface UseSelectParamResult<K extends string | number, AllowEmpty extends boolean> {
  select: JSX.Element;
  value: AllowEmpty extends true ? SelectParamOption<K> | null : SelectParamOption<K>;
}

export function useSelectParam<K extends string | number = string, AllowEmpty extends boolean = true> (
  options: Array<SelectParamOption<K>>,
  defaultValue: SelectParamOption<K>,
  label: string,
  props: FormControlProps = {},
  selectProps: SelectProps<SelectParamOption<K>> = {},
): UseSelectParamResult<K, AllowEmpty> {
  const [value, setValue] = useState<SelectParamOption<K> | (AllowEmpty extends true ? '' : never)>(defaultValue);
  const id = unstable_useId() ?? 'fatal-id';

  const handleValueChange: SelectProps<SelectParamOption<K>>['onChange'] = useEventCallback((event) => {
    setValue(event.target.value as SelectParamOption<K>);
  });

  const select = useMemo(() => (
    <FormControl variant="standard" {...props}>
      {label && <InputLabel id={`selector-${id}-label`}>{label}</InputLabel>}
      <Select<SelectParamOption<K>>
        id={`selector-${id}`}
        size="small"
        value={value}
        onChange={handleValueChange}
        label={label}
        native={false}
        autoWidth
        renderValue={renderSelectParamOption}
        {...selectProps}
      >
        {options.map(option => (
          <MenuItem key={option.key} value={option as any}>{option.title}</MenuItem>
        ))}
      </Select>
    </FormControl>
  ), [options, value, id]);

  return {
    select,
    value: (value === '' ? null : value) as never,
  };
}
