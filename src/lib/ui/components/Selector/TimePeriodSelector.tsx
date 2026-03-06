import { ActivityTypeOption, PERIOD_OPTIONS } from '@/lib/widgets-utils/ui';
import * as React from 'react';
import { useMemo } from 'react';

import { useSimpleSelect } from './Select';

export interface TimePeriodSelectorProps {
  id?: string;
  enums?: string[];
  onValueChange?: (newValue: string) => void;
  defaultValue?: string;
}

export function TimePeriodSelector (props: TimePeriodSelectorProps) {
  const { onValueChange, id, defaultValue } = props;

  const options = useMemo(() => {
    if (props.enums) {
      return props.enums.map(key => PERIOD_OPTIONS.find(op => op.key === key)).filter(Boolean) as ActivityTypeOption[];
    }
    return PERIOD_OPTIONS;
  }, [props.enums]);

  const { select: periodSelect, value: period } = useSimpleSelect(
    options,
    PERIOD_OPTIONS.find((i) => i.key === defaultValue) || PERIOD_OPTIONS[0],
    id,
  );

  React.useEffect(() => {
    onValueChange && onValueChange(period);
  }, [period]);

  return <>{periodSelect}</>;
}
