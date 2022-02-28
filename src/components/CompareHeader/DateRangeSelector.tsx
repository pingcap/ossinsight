import * as React from 'react';
import TextField from '@mui/material/TextField';
import DateRangePicker from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import {useState} from "react";
import {RangeInput} from "@mui/lab/DateRangePicker/RangeTypes";

const minDate = new Date("2011-01-01");
const maxDate = new Date();

export default function DateRangeSelector(props) {
  const [value, setValue] = useState<RangeInput<Date>>([null, null]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateRangePicker
        startText="Start"
        endText="End"
        minDate={minDate}
        maxDate={maxDate}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          props.onChange(newValue);
        }}
        renderInput={(startProps, endProps) => (
          <React.Fragment>
            <TextField {...startProps} size="small"/>
            <Box sx={{ mx: 2 }}> to </Box>
            <TextField {...endProps} size="small"/>
          </React.Fragment>
        )}
      />
    </LocalizationProvider>
  );
}
