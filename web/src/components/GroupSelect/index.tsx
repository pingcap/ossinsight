import React, { useCallback, useContext } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from '@mui/material/MenuItem';
import GroupSelectContext from "./GroupSelectContext";
import Box from "@mui/material/Box";
import { groups } from "./groups";
import { useIsDarkTheme } from "@site/src/hooks/theme";

declare global {
  interface Window {
    osdbgroup: {
      group_name: string
      repos: {
        group_name: string
        name: string
        id: number
      }[]
    }[];
  }
}

export default function GroupSelect() {
  const isDarkTheme = useIsDarkTheme();
  const { group, setGroup } = useContext(GroupSelectContext);

  const handleChange = useCallback((event: SelectChangeEvent) => {
    setGroup(event.target.value);
  }, []);

  return (
    <Box position="sticky" sx={{
      my: 2,
      py: 2,
      top: 'var(--ifm-navbar-height)',
      zIndex: 'calc(var(--ifm-z-index-fixed-mui) + 1)',
      backgroundColor: isDarkTheme ? 'var(--ifm-background-color)' : 'background.default',
      borderBottom: '1px solid transparent',
      borderBottomColor: 'divider',
      textAlign: 'right',
    }}>
      Try to compare tidb with
      <Select<string>
        autoWidth
        value={group}
        variant="standard"
        onChange={handleChange}
        placeholder="Select..."
        sx={{ minWidth: 100, ml: 1 }}
      >
        <MenuItem key="none" value={undefined}>None</MenuItem>
        {Object.keys(groups).map(name => (
          <MenuItem key={name} value={name} disabled={name === 'tidb'}>{name}</MenuItem>
        ))}
      </Select>
    </Box>
  );
}