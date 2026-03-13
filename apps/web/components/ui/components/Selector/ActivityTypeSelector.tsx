import { ACTIVITY_TYPE_OPTIONS, ActivityTypeOption } from '@/utils/options/activity';
import * as React from 'react';
import { useMemo } from 'react';
import { useSimpleSelect } from './Select';

export interface ActivityTypeSelectorProps {
  id?: string
  onValueChange?: (newValue: string) => void;
  enums?: string[];
  showLabel?: boolean;
  defaultValue?: string;
}

export function ActivityTypeSelector (props: ActivityTypeSelectorProps) {
  const { onValueChange, id, defaultValue = 0 } = props;

  const options = useMemo(() => {
    if (props.enums) {
      return props.enums.map(key => ACTIVITY_TYPE_OPTIONS.find(op => op.key === key)).filter(Boolean) as ActivityTypeOption[];
    }
    return ACTIVITY_TYPE_OPTIONS;
  }, [props.enums]);

  const { select: activityTypeSelect, value: activityType } = useSimpleSelect(
    options,
    options.find((i) => i.key === defaultValue) ||
    options[0],
    id,
  );

  React.useEffect(() => {
    onValueChange && onValueChange(activityType);
  }, [activityType]);

  return <>{activityTypeSelect}</>;
}