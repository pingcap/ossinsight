import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Select, useEventCallback } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select/SelectInput";


export type TileSelectOption = {
  key: string
  label: string
}

export interface TileSelectProps {
  value: string;
  onSelect: (value: string) => void;
  options: TileSelectOption[];
}

export default function TileSelect({ options, value, onSelect }: TileSelectProps) {
  const ref = useRef<HTMLOListElement>();
  const refs = useRef<HTMLLIElement[]>(options.map(() => undefined));
  const [length, setLength] = useState(options.length);

  useEffect(() => {
    refs.current = options.map(() => undefined);
  }, [options]);

  const recompute = useEventCallback(() => {
    if (!ref.current) {
      return;
    }
    let width = ref.current.clientWidth;
    let i = 0;

    for (const el of refs.current) {
      if (!el) {
        break;
      }
      if (el.clientWidth + el.offsetLeft >= width) {
        break;
      }
      i += 1;
    }
    setLength(i);
  });

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    recompute();

    if (typeof ResizeObserver !== undefined) {
      const ro = new ResizeObserver(() => {
        recompute();
      });
      ro.observe(ref.current);
      return () => {
        ro.unobserve(ref.current);
        ro.disconnect();
      };
    } else {
      window.addEventListener('resize', recompute);
      return () => {
        window.removeEventListener('resize', recompute);
      };
    }
  }, [recompute]);

  const handleSelect = useCallback((event: SelectChangeEvent) => {
    onSelect(event.target.value);
  }, [onSelect]);

  const selectValue = useMemo(() => {
    return options.slice(length).find(({ key }) => key === value)?.key ?? null;
  }, [options, length, value]);

  return (
    <Box flex={1} position="relative" maxWidth="100%" overflow="hidden">
      <Stack direction="row" position="relative" width="100%" alignContent="center">
        <Box
          position="absolute"
          left={0}
          top={0}
          width="calc(100% - 120px)"
        >
          <Stack
            ref={ref}
            component="ol"
            direction="row"
            visibility="hidden"
            position="absolute"
            left={0}
            top={0}
            width="100%"
            p={0}
            m={0}
            sx={{ pointerEvents: 'none', listStyle: 'none' }}
          >
            {options.map(({ key, label }, index) => (
              <Option
                ref={el => refs.current[index] = el}
                key={key}
                value={key}
                label={label}
                selected={value === key}
                onClick={onSelect}
              />
            ))}
          </Stack>
        </Box>
        <Box>
          <Stack
            component="ol"
            direction="row"
            alignItems="center"
            p={0}
            m={0}
            height="100%"
            sx={{ listStyle: 'none' }}
          >
            {options.slice(0, length).map(({ key, label }) => (
              <Option
                key={key}
                value={key}
                label={label}
                selected={value === key}
                onClick={onSelect}
              />
            ))}
          </Stack>
        </Box>
        {options.length > length ? (
          <Select
            label="Other"
            displayEmpty
            size="small"
            value={selectValue}
            onChange={handleSelect}
            sx={{
              minWidth: 120,
              maxWidth: 120,
              fontSize: 14,
              ml: 2,
              '.MuiSelect-select': {
                pb: 0,
                pl: 1,
              },
              color: selectValue ? 'primary.main' : undefined,
              border: '1px solid transparent',
              borderColor: selectValue ? 'primary.main' : undefined,
              borderRadius: 0.75,
            }}
            variant="standard"
            disableUnderline
            renderValue={value => value ?? 'Others'}
          >
            {options.slice(length).map(({ key, label }) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        ) : undefined}
      </Stack>
    </Box>
  );
}

interface OptionProps {
  value: string;
  label: string;
  selected?: boolean;
  onClick?: (value: string) => void;
}

const Option = forwardRef(function Option({
                                            value,
                                            label,
                                            selected = false,
                                            onClick,
                                          }: OptionProps, ref: ForwardedRef<HTMLLIElement>) {
  const handleClick = useCallback(() => {
    onClick(value);
  }, [value]);

  return (
    <Box
      ref={ref}
      component="li"
      onClick={handleClick}
      display="flex"
      alignItems="center"
      justifyContent="center"
      border="transparent 1px solid"
      borderRadius={0.75}
      fontSize={14}
      lineHeight="1"
      sx={{
        transition: 'all .2s ease',
        '&:not(:first-child)': { ml: 2 },
        px: 1,
        py: 0.5,
        userSelect: 'none',
        cursor: selected ? undefined : 'pointer',
        borderColor: selected ? 'primary.main' : undefined,
        color: selected ? 'primary.main' : undefined,
      }}
    >
      {label}
    </Box>
  );
});
