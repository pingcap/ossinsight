import { ParameterDefinition, TimePeriodParameterDefinition } from '@ossinsight/widgets-types';
import * as React from 'react';
import { TimePeriodSelector, TimeZoneSelector } from '@/lib/ui';

export function TimePeriodSelect({
  id,
  enums,
  value,
  onValueChange,
}: {
  id: string
  enums?: string[];
  value: any;
  onValueChange: (newValue: string) => void;
}) {
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      onValueChange(newValue);
    },
    [onValueChange]
  );

  return (
    <>
      <TimePeriodSelector
        id={id}
        enums={enums}
        defaultValue={value}
        onValueChange={handleValueChange}
      />
    </>
  );
}

export function TimeZoneSelect({
  id,
  value,
  onValueChange,
}: {
  id: string;
  value: string;
  onValueChange: (newValue: string) => void;
}) {
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      onValueChange(newValue);
    },
    [onValueChange]
  );

  return (
    <>
      <TimeZoneSelector
        id={id}
        value={value}
        onValueChange={handleValueChange}
      />
    </>
  );
}
