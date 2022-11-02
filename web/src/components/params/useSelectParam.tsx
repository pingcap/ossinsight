import React, { useMemo, useState } from 'react';
import Select, { SelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormControl, InputLabel, unstable_useId, useEventCallback } from '@mui/material';
import { SelectInputProps } from '@mui/material/Select/SelectInput';
import { FormControlProps } from '@mui/material/FormControl/FormControl';
import { coalesceNullish } from '@site/src/utils/value';
import { isString } from 'ahooks/es/utils';

export type SelectParamOption<K extends string | number = string> = {
  key: K;
  title: string;
};

function renderSelectParamOption<K extends string | number> (option: SelectParamOption<K> | '') {
  return isString(option) ? '' : option.title;
}

export function useSelectParam<K extends string | number = string> (options: Array<SelectParamOption<K>>, defaultValue: SelectParamOption<K> | null = null, label: string = '', props: FormControlProps = {}, selectProps: SelectProps<SelectParamOption<K>> = {}) {
  const [value, setValue] = useState<SelectParamOption<K> | ''>(coalesceNullish(defaultValue, ''));
  const id = unstable_useId() ?? 'fatal-id';

  const handleValueChange: SelectInputProps<SelectParamOption<K>>['onChange'] = useEventCallback((event) => {
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

  return { select, value };
}
