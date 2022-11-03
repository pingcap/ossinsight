import * as React from 'react';
import DateRangePicker from '@mui/lab/DateRangePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { TextField, Box } from '@mui/material';

const minDate = new Date('2011-01-01');
const maxDate = new Date();

export interface DateRangeSelectorProps {
  value: [Date | null, Date | null];
  onChange: (range: [Date | null, Date | null]) => void;
}

export default function DateRangeSelector (props: DateRangeSelectorProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateRangePicker<Date>
        startText="Start"
        endText="End"
        minDate={minDate}
        maxDate={maxDate}
        value={props.value}
        onChange={(newValue) => {
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
