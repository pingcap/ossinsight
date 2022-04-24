import React, {useCallback, useMemo, useState, MouseEvent, useContext} from "react";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import GroupSelectContext from "./GroupSelectContext";
import Box from "@mui/material/Box";
import useThemeContext from "@theme/hooks/useThemeContext";
import {groups} from "./groups";

declare global {
  interface Window {
    osdbgroup: {
      group_name: string
      repos: {
        group_name: string
        name: string
        id: number
      }[]
    }[]
  }
}

export default function GroupSelect () {
  const {isDarkTheme} = useThemeContext();
  const { group, setGroup } = useContext(GroupSelectContext)

  const handleChange = useCallback((event: SelectChangeEvent) => {
    setGroup(event.target.value)
  }, [])

  return (
    <Box position='sticky' sx={{
      my: 2,
      py: 2,
      top: 'var(--ifm-navbar-height)',
      zIndex: 'var(--ifm-z-index-fixed-mui)',
      backgroundColor: isDarkTheme ? 'var(--ifm-background-color)' : 'background.default',
      borderBottom: '1px solid transparent',
      borderBottomColor: 'divider',
      textAlign: 'right'
    }}>
      Try to compare tidb with
      <Select<string>
        autoWidth
        value={group}
        variant='standard'
        onChange={handleChange}
        placeholder='Select...'
        sx={{ minWidth: 100, ml: 1 }}
      >
        <MenuItem key='none' value={undefined}>None</MenuItem>
        {Object.keys(groups).map(name => (
          <MenuItem key={name} value={name}>{name}</MenuItem>
        ))}
      </Select>
    </Box>
  )
}